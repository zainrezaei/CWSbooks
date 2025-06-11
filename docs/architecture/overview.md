# Architecture Overview

## System Architecture

CWSbooks is built using a modern, scalable architecture leveraging Next.js for the frontend and Supabase as a Backend-as-a-Service (BaaS) solution.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Next.js App   │────▶│    Supabase     │────▶│     Stripe      │
│   (Frontend)    │     │   (Backend)     │     │   (Payments)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ├── PostgreSQL DB
        │                       ├── Authentication
        │                       ├── Storage (Book files)
        │                       ├── Realtime subscriptions
        │                       └── Edge Functions
        │
        └── Vercel (Hosting)
```

## Core Components

### 1. Frontend (Next.js)

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context + Supabase Realtime
- **Components**:
  - Book Reader with pagination
  - User Dashboard
  - Payment flows
  - Admin panel for book management

### 2. Backend (Supabase)

#### Database (PostgreSQL)
- User management and profiles
- Books and chapters storage
- Reading progress tracking
- Subscription management

#### Authentication
- Email/Password authentication
- OAuth providers (Google, GitHub)
- Row Level Security (RLS) for data protection

#### Storage
- Book cover images
- Author avatars
- Optional: Book PDFs/EPUBs for offline reading

#### Edge Functions
- Payment webhook handling
- Complex business logic
- Email notifications

### 3. Payment System (Stripe)

- Subscription management
- Payment processing
- Webhook integration for status updates
- Customer portal for self-service

## Data Flow

### Reading Flow
1. User lands on book page → sees free preview chapter
2. Attempts to read beyond preview → paywall appears
3. User subscribes → gains full access
4. Reading progress saved automatically
5. Can continue from any device

### Authentication Flow
```
User → Supabase Auth → JWT Token → Protected Routes
                    ↓
                RLS Policies → Secure Data Access
```

### Payment Flow
```
User → Stripe Checkout → Payment → Webhook → Supabase
                                          ↓
                                    Update User Status
```

## Security Architecture

### Row Level Security (RLS)
- Users can only access their own data
- Books have public metadata but protected content
- Reading progress is user-specific

### API Security
- Supabase handles authentication
- API routes protected with middleware
- Rate limiting on sensitive endpoints

### Content Protection
- Chapter content served through authenticated endpoints
- No direct file access
- Optional watermarking for downloaded content

## Scalability Considerations

### Performance
- Next.js SSR/SSG for fast page loads
- Supabase edge network for low latency
- Image optimization with Next.js Image
- Lazy loading for book content

### Caching Strategy
- Static book metadata cached at build time
- User-specific data fetched on demand
- Reading position updates debounced
- CDN for static assets

### Database Optimization
- Indexes on frequently queried fields
- Materialized views for statistics
- Connection pooling via Supabase

## Monitoring & Analytics

### Application Monitoring
- Vercel Analytics for performance
- Error tracking with Sentry
- Custom analytics for reading behavior

### Business Metrics
- Conversion rates (free to paid)
- Reading engagement metrics
- Popular books and chapters
- User retention rates

## Development Workflow

### Local Development
```bash
# Frontend runs on localhost:3000
npm run dev

# Supabase local development
supabase start
```

### Environment Management
- `.env.local` for local development
- Environment variables in Vercel
- Supabase project settings

### CI/CD Pipeline
1. Push to GitHub
2. Vercel automatic deployment
3. Preview deployments for PRs
4. Production deployment on merge to main

## Technology Decisions

### Why Next.js?
- SEO-friendly for book discovery
- Excellent performance
- Built-in API routes
- Great developer experience

### Why Supabase?
- Complete backend solution
- Real-time capabilities
- Built-in authentication
- Scales automatically
- Open source

### Why Stripe?
- Industry standard for payments
- Excellent documentation
- Subscription management
- Global payment support