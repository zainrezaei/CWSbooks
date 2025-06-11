# CWSbooks - Freemium Book Reading Platform

A modern web application for reading books online with a freemium model, built with Next.js and Supabase.

## 🚀 Overview

CWSbooks is a digital book reading platform that offers:
- **Free preview chapters** for every book
- **Subscription-based** access to full content
- **Progress tracking** across devices
- **Beautiful reading experience** with customizable themes

## 📚 Features

### Core Features
- 📖 **Freemium Model**: First chapter free, subscribe for full access
- 📊 **Reading Progress**: Automatic position saving and syncing
- 🎨 **Customizable Reader**: Font size, themes, and reading preferences
- 📱 **Responsive Design**: Works seamlessly on all devices
- 🔐 **Secure Authentication**: Powered by Supabase Auth
- 💳 **Payment Integration**: Stripe for subscriptions

### User Dashboard
- Continue reading from where you left off
- View reading statistics and progress
- Manage your library
- Track reading streaks

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Styling**: Tailwind CSS
- **Payment**: Stripe
- **Deployment**: Vercel

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/CWSbooks.git
cd CWSbooks
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. Start the development server:
```bash
npm run dev
```

## 📖 Documentation

- [Architecture Overview](./docs/architecture/overview.md)
- [Database Schema](./docs/database/schema.md)
- [API Documentation](./docs/api/README.md)
- [Deployment Guide](./docs/guides/deployment.md)

## 🏗 Project Structure

```
CWSbooks/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── books/             # Book browsing and reading
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility functions and configs
│   ├── supabase/         # Supabase client and helpers
│   └── stripe/           # Stripe integration
├── docs/                  # Documentation
└── public/               # Static assets
```

## 🚀 Deployment

See [Deployment Guide](./docs/guides/deployment.md) for detailed instructions.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📧 Contact

For questions or support, please contact [your-email@example.com]