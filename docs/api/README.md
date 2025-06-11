# API Documentation

## Overview

CWSbooks uses a combination of Next.js API routes and Supabase Edge Functions for backend functionality. This document covers all API endpoints, authentication, and data structures.

## Authentication

All authenticated requests require a JWT token from Supabase Auth.

```typescript
// Headers for authenticated requests
{
  "Authorization": "Bearer <supabase-jwt-token>",
  "Content-Type": "application/json"
}
```

## Next.js API Routes

### Stripe Webhook Handler

**Endpoint:** `POST /api/webhooks/stripe`

Handles Stripe webhook events for subscription updates.

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  
  // Verify webhook signature
  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  )
  
  // Handle different event types
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      // Update user subscription status in Supabase
      break
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      break
  }
}
```

### Create Checkout Session

**Endpoint:** `POST /api/checkout/session`

Creates a Stripe checkout session for subscription.

```typescript
// Request
{
  "priceId": "price_xxxxx",
  "userId": "uuid"
}

// Response
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

### Customer Portal

**Endpoint:** `POST /api/stripe/portal`

Creates a Stripe customer portal session.

```typescript
// Request
{
  "customerId": "cus_xxxxx"
}

// Response
{
  "portalUrl": "https://billing.stripe.com/..."
}
```

## Supabase Edge Functions

### Update Reading Progress

**Function:** `update-reading-progress`

Updates user's reading progress with debouncing.

```typescript
// Request
{
  "bookId": "uuid",
  "chapterId": "uuid",
  "position": 1234,
  "completionPercentage": 45.5
}

// Response
{
  "success": true,
  "progress": {
    "id": "uuid",
    "lastReadAt": "2024-01-15T..."
  }
}
```

### Get Reading Analytics

**Function:** `get-reading-analytics`

Returns user's reading statistics and analytics.

```typescript
// Request
{
  "userId": "uuid",
  "timeframe": "week" | "month" | "year" | "all"
}

// Response
{
  "totalBooksRead": 12,
  "totalReadingTime": 43200, // seconds
  "currentStreak": 7,
  "booksInProgress": 3,
  "readingByDay": [
    {
      "date": "2024-01-15",
      "minutes": 45
    }
  ],
  "favoriteGenres": ["fiction", "science"],
  "completionRate": 0.75
}
```

### Process Book Upload

**Function:** `process-book-upload`

Handles book file upload and chapter extraction (Admin only).

```typescript
// Request
{
  "fileUrl": "https://storage.supabase.co/...",
  "bookMetadata": {
    "title": "Book Title",
    "author": "Author Name",
    "isbn": "978-..."
  }
}

// Response
{
  "bookId": "uuid",
  "chaptersCreated": 15,
  "status": "success"
}
```

## Supabase Realtime Subscriptions

### Reading Progress Updates

Subscribe to real-time reading progress updates:

```typescript
const subscription = supabase
  .channel('reading-progress')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'reading_progress',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Handle progress update
      console.log('Progress updated:', payload.new)
    }
  )
  .subscribe()
```

### Active Readers (Social Feature)

See who else is reading the same book:

```typescript
const subscription = supabase
  .channel(`book-readers-${bookId}`)
  .on('presence', { event: 'sync' }, () => {
    const state = subscription.presenceState()
    console.log('Active readers:', state)
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('Reader joined:', newPresences)
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('Reader left:', leftPresences)
  })
  .subscribe()
```

## Database Direct Access (via Supabase Client)

### Books Queries

```typescript
// Get all books with pagination
const { data: books, error } = await supabase
  .from('books')
  .select('*')
  .eq('is_active', true)
  .order('created_at', { ascending: false })
  .range(0, 9)

// Search books
const { data: results } = await supabase
  .from('books')
  .select('*')
  .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
  .limit(10)

// Get book with chapters
const { data: book } = await supabase
  .from('books')
  .select(`
    *,
    chapters (
      id,
      chapter_number,
      title,
      is_preview
    )
  `)
  .eq('id', bookId)
  .single()
```

### User Library Queries

```typescript
// Get user's library
const { data: library } = await supabase
  .from('user_books')
  .select(`
    *,
    book:books (
      id,
      title,
      author,
      cover_image_url
    )
  `)
  .eq('user_id', userId)
  .order('purchased_at', { ascending: false })

// Check book access
const { data: hasAccess } = await supabase
  .rpc('user_has_book_access', { book_uuid: bookId })
```

### Reading Progress Queries

```typescript
// Get continue reading list
const { data: continueReading } = await supabase
  .from('reading_progress')
  .select(`
    *,
    book:books (
      id,
      title,
      author,
      cover_image_url
    ),
    chapter:chapters (
      id,
      title,
      chapter_number
    )
  `)
  .eq('user_id', userId)
  .order('last_read_at', { ascending: false })
  .limit(5)

// Get reading stats
const { data: stats } = await supabase
  .rpc('get_reading_stats', { user_uuid: userId })
```

## Error Handling

All API responses follow this error format:

```typescript
// Error response
{
  "error": {
    "message": "Human readable error message",
    "code": "ERROR_CODE",
    "details": {} // Optional additional details
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: User lacks permission
- `NOT_FOUND`: Resource not found
- `INVALID_REQUEST`: Invalid request data
- `PAYMENT_REQUIRED`: Subscription needed
- `RATE_LIMITED`: Too many requests

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Reading progress updates: 60 requests per minute
- General API: 100 requests per minute

## TypeScript Types

```typescript
// Common types used across the API
interface Book {
  id: string
  title: string
  author: string
  description: string
  coverImageUrl: string
  totalChapters: number
  previewChapters: number
  genre: string[]
  createdAt: string
}

interface Chapter {
  id: string
  bookId: string
  chapterNumber: number
  title: string
  content: string
  wordCount: number
  isPreview: boolean
}

interface ReadingProgress {
  id: string
  userId: string
  bookId: string
  currentChapterId: string
  currentPosition: number
  completionPercentage: number
  lastReadAt: string
}

interface Subscription {
  id: string
  userId: string
  status: 'active' | 'cancelled' | 'past_due'
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}
```