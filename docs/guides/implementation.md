# Implementation Guide

This guide walks through implementing the core features of CWSbooks with code examples and best practices.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Authentication Implementation](#authentication-implementation)
3. [Book Reader Component](#book-reader-component)
4. [Reading Progress Tracking](#reading-progress-tracking)
5. [Subscription & Paywall](#subscription--paywall)
6. [Dashboard Implementation](#dashboard-implementation)

## Project Setup

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest cwsbooks --typescript --tailwind --app
cd cwsbooks
```

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install stripe @stripe/stripe-js
npm install zustand # for state management
npm install react-intersection-observer # for reading position tracking
npm install date-fns # for date formatting
```

### 3. Environment Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase Client Setup

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

## Authentication Implementation

### Auth Context Provider

```typescript
// contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

### Protected Route Middleware

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/books/:id/read/:path*'],
}
```

## Book Reader Component

### Main Reader Component

```typescript
// components/BookReader/BookReader.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { createClient } from '@/lib/supabase/client'
import { useReadingProgress } from '@/hooks/useReadingProgress'
import { ChapterContent } from './ChapterContent'
import { ReaderControls } from './ReaderControls'
import { Paywall } from './Paywall'

interface BookReaderProps {
  bookId: string
  chapterId: string
  initialContent: string
  isPreview: boolean
  hasAccess: boolean
}

export function BookReader({
  bookId,
  chapterId,
  initialContent,
  isPreview,
  hasAccess,
}: BookReaderProps) {
  const [content, setContent] = useState(initialContent)
  const [fontSize, setFontSize] = useState(16)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const contentRef = useRef<HTMLDivElement>(null)
  const { saveProgress, currentPosition } = useReadingProgress(bookId, chapterId)
  
  // Track reading position
  const { ref: progressRef } = useInView({
    threshold: 0,
    onChange: (inView, entry) => {
      if (inView && hasAccess) {
        const scrollPercentage = 
          (window.scrollY / document.documentElement.scrollHeight) * 100
        saveProgress(scrollPercentage)
      }
    },
  })

  // Show paywall for non-preview chapters without access
  if (!isPreview && !hasAccess) {
    return <Paywall bookId={bookId} />
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <ReaderControls
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        theme={theme}
        onThemeChange={setTheme}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div ref={progressRef}>
          <ChapterContent
            ref={contentRef}
            content={content}
            fontSize={fontSize}
          />
        </div>
        
        {isPreview && (
          <div className="mt-16 p-8 bg-blue-50 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">
              Enjoying the preview?
            </h3>
            <p className="mb-6">
              Subscribe to continue reading this book and get access to our entire library.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Subscribe Now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

### Reading Progress Hook

```typescript
// hooks/useReadingProgress.ts
import { useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import debounce from 'lodash/debounce'

export function useReadingProgress(bookId: string, chapterId: string) {
  const supabase = createClient()
  const lastSavedPosition = useRef(0)

  const saveProgress = useCallback(
    debounce(async (position: number) => {
      // Only save if position changed significantly (>1%)
      if (Math.abs(position - lastSavedPosition.current) < 1) return
      
      lastSavedPosition.current = position

      const { error } = await supabase.rpc('update_reading_progress', {
        book_id: bookId,
        chapter_id: chapterId,
        position: Math.round(position),
        completion_percentage: position,
      })

      if (error) {
        console.error('Failed to save progress:', error)
      }
    }, 1000),
    [bookId, chapterId]
  )

  // Load saved position on mount
  useEffect(() => {
    async function loadProgress() {
      const { data } = await supabase
        .from('reading_progress')
        .select('current_position')
        .eq('book_id', bookId)
        .single()

      if (data?.current_position) {
        // Scroll to saved position
        const scrollPosition = 
          (data.current_position / 100) * document.documentElement.scrollHeight
        window.scrollTo(0, scrollPosition)
        lastSavedPosition.current = data.current_position
      }
    }

    loadProgress()
  }, [bookId])

  return {
    saveProgress,
    currentPosition: lastSavedPosition.current,
  }
}
```

## Subscription & Paywall

### Paywall Component

```typescript
// components/BookReader/Paywall.tsx
'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { createClient } from '@/lib/supabase/client'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface PaywallProps {
  bookId: string
}

export function Paywall({ bookId }: PaywallProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubscribe = async () => {
    setLoading(true)
    
    try {
      // Create checkout session
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
          bookId, // For tracking conversions
        }),
      })

      const { checkoutUrl } = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Continue Reading with Premium
          </h2>
          <p className="text-gray-600 mb-6">
            Get unlimited access to our entire library of books
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Unlimited access to all books</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Sync progress across devices</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>New books added weekly</span>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-baseline justify-center mb-4">
            <span className="text-4xl font-bold">$9.99</span>
            <span className="text-gray-600 ml-2">/month</span>
          </div>
          
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Start Reading'}
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-4">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </div>
    </div>
  )
}
```

### Stripe Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Create Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update user's subscription status
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: subscription.status === 'active' ? 'active' : 'cancelled',
            subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
            stripe_customer_id: subscription.customer as string,
          })
          .eq('stripe_customer_id', subscription.customer)

        if (error) throw error
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Mark subscription as cancelled
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'cancelled',
            subscription_expires_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', subscription.customer)

        if (error) throw error
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
```

## Dashboard Implementation

### User Dashboard Page

```typescript
// app/dashboard/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ContinueReading } from '@/components/Dashboard/ContinueReading'
import { ReadingStats } from '@/components/Dashboard/ReadingStats'
import { Library } from '@/components/Dashboard/Library'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch user's reading data
  const [
    { data: continueReading },
    { data: stats },
    { data: library }
  ] = await Promise.all([
    supabase
      .from('reading_progress')
      .select(`
        *,
        book:books(*),
        chapter:chapters(*)
      `)
      .eq('user_id', user.id)
      .order('last_read_at', { ascending: false })
      .limit(5),
    
    supabase
      .rpc('get_reading_stats', { user_uuid: user.id }),
    
    supabase
      .from('user_books')
      .select('*, book:books(*)')
      .eq('user_id', user.id)
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
        
        <div className="grid gap-8">
          {/* Continue Reading Section */}
          <ContinueReading books={continueReading || []} />
          
          {/* Reading Statistics */}
          <ReadingStats stats={stats?.[0] || {}} />
          
          {/* User Library */}
          <Library books={library || []} />
        </div>
      </div>
    </div>
  )
}
```

### Continue Reading Component

```typescript
// components/Dashboard/ContinueReading.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

interface ContinueReadingProps {
  books: Array<{
    book: {
      id: string
      title: string
      author: string
      cover_image_url: string
    }
    chapter: {
      id: string
      chapter_number: number
      title: string
    }
    completion_percentage: number
    last_read_at: string
  }>
}

export function ContinueReading({ books }: ContinueReadingProps) {
  if (books.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Continue Reading</h2>
        <p className="text-gray-600">
          Start reading a book to see it here!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Continue Reading</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {books.map((item) => (
          <Link
            key={item.book.id}
            href={`/books/${item.book.id}/read/${item.chapter.id}`}
            className="group flex gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow"
          >
            <Image
              src={item.book.cover_image_url}
              alt={item.book.title}
              width={60}
              height={90}
              className="rounded object-cover"
            />
            
            <div className="flex-1">
              <h3 className="font-medium group-hover:text-blue-600">
                {item.book.title}
              </h3>
              <p className="text-sm text-gray-600">{item.book.author}</p>
              <p className="text-xs text-gray-500 mt-1">
                Chapter {item.chapter.chapter_number}
              </p>
              
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${item.completion_percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(item.last_read_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

## Best Practices

1. **Performance Optimization**
   - Use React Server Components where possible
   - Implement pagination for book lists
   - Lazy load images and heavy components
   - Debounce reading progress updates

2. **Security**
   - Always validate user permissions server-side
   - Use Supabase RLS policies
   - Sanitize user input
   - Never expose service role keys

3. **User Experience**
   - Show loading states
   - Handle errors gracefully
   - Provide offline support with PWA
   - Make the reader responsive

4. **Code Organization**
   - Keep components small and focused
   - Use custom hooks for business logic
   - Implement proper TypeScript types
   - Follow consistent naming conventions