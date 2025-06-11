# Frontend Setup Guide

## Overview

The CWSbooks frontend is built with Next.js 14, TypeScript, and Tailwind CSS, featuring a beautiful design inspired by Persian/Afghan cultural elements with modern gradients and animations.

## Key Features Implemented

- 🎨 **Cultural Design System**: Gradient backgrounds with gold, blue, and earth tones
- 📚 **3D Book Display**: Interactive book cover with hover animations
- 📖 **Reading Preview**: First chapter preview with progress tracking
- 💰 **Paywall System**: Beautiful modal design for subscription
- 📊 **Animated Stats**: Number counters with scroll animations
- 📱 **Fully Responsive**: Mobile-first design approach

## Quick Start

1. **Install Dependencies**
```bash
cd CWSbooks
npm install
```

2. **Set Up Environment Variables**
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase and Stripe keys
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Open Browser**
Visit http://localhost:3000

## Design System

### Color Palette
- **Cultural Gold**: `#D4AF37` - Primary accent color
- **Mountain Blue**: `#2563eb` - Secondary color
- **Dark Brown**: `#8b4513` - Text and accents
- **Warm Cream**: `#fdfbf7` - Background
- **Cultural Black/Red/Green**: Flag-inspired accents

### Components Structure
```
app/
├── components/
│   ├── Header/          # Navigation with gradient background
│   ├── Hero/            # Hero section with 3D book
│   ├── BookPreview/     # Reading preview with progress
│   ├── Paywall/         # Subscription modal
│   └── Stats/           # Animated statistics
├── books/[id]/read/     # Individual book reading page
└── page.tsx             # Landing page
```

### Key Animations
- **3D Book Rotation**: Hover effect on book cover
- **Progress Bar**: Shimmer animation on reading progress
- **Number Counters**: Animated counting on scroll
- **Floating Elements**: Subtle float animations
- **Modal Transitions**: Spring animations on paywall

## Next Steps

1. **Connect Supabase**:
   - Set up authentication
   - Create database tables
   - Implement data fetching

2. **Integrate Stripe**:
   - Set up checkout flow
   - Handle webhooks
   - Manage subscriptions

3. **Add More Features**:
   - User dashboard
   - Book library
   - Search functionality
   - Reading preferences

## Customization

### Changing Colors
Edit `tailwind.config.ts` to modify the cultural color palette:

```typescript
colors: {
  'cultural': {
    gold: '#D4AF37',    // Change primary accent
    blue: '#2563eb',    // Change secondary
    // ... other colors
  }
}
```

### Modifying Animations
Animations are defined in:
- `globals.css` for CSS animations
- Component files for Framer Motion animations

### Adding New Books
Currently using mock data. To add real books:
1. Create Supabase tables (see database schema)
2. Update components to fetch from Supabase
3. Implement dynamic routing

## Performance Optimizations

- Next.js Image optimization
- Lazy loading components
- Debounced progress tracking
- CSS animations over JS where possible
- Tailwind CSS purging unused styles

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (iOS Safari, Chrome Mobile)
- Progressive enhancement approach