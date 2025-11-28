# ABTester - A/B Testing Platform

A comprehensive A/B testing tool with ICE framework prioritization, statistical analysis, and segment analysis capabilities.

## ✨ Features

- **ICE Score Calculator** - Prioritize test ideas using Impact, Confidence, and Ease scores
- **Test Ideas Management** - Full CRUD operations with status tracking (Planned → Running → Completed)
- **Statistical Tools** - Z-test, T-test, Chi-square testing, and sample size calculator
- **Segment Analysis** - Analyze by device, user type, traffic source, and geography
- **Behavioral Economics** - Test ideas based on behavioral economics principles
- **Real-time Dashboard** - Visual overview of all test performance
- **Supabase Backend** - Secure authentication and data persistence
- **Offline Support** - Works with localStorage when backend is unavailable
- **Multi-language** - Korean and English support

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase (Optional - works without it)

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `supabase/schema.sql`
3. Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For detailed setup instructions, see [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:5173

## 📚 Documentation

- **[Supabase Setup Guide](./SUPABASE_SETUP_GUIDE.md)** - Complete backend integration guide
- **[Backend Implementation Summary](./BACKEND_IMPLEMENTATION.md)** - Technical architecture overview
- **[Segment Analysis Data Sources](./SEGMENT_ANALYSIS_SOURCES.md)** - Data verification & sources ⚠️

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **Icons**: Lucide React

## 📁 Project Structure

```
ABTester/
├── src/
│   ├── components/        # React components
│   │   ├── Auth/         # Authentication pages
│   │   ├── ui/           # Reusable UI components (40+)
│   │   └── ...           # Feature components
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useTestIdeas.ts
│   ├── services/         # API service layer
│   │   ├── auth.service.ts
│   │   └── test-ideas.service.ts
│   ├── lib/
│   │   ├── supabase/     # Supabase client & types
│   │   └── utils/        # Utility functions
│   └── types/            # TypeScript types
└── supabase/
    └── schema.sql        # Database schema
```

## 🔒 Security

- Row Level Security (RLS) policies enabled
- User data isolation
- Secure authentication with Supabase Auth
- Environment variables for sensitive data

## 📊 Database Schema

The project uses PostgreSQL with the following main tables:
- `profiles` - User profiles
- `test_ideas` - A/B test ideas with ICE scores

All tables have:
- Automatic `updated_at` triggers
- Optimized indexes for performance
- RLS policies for security

## 🛠️ Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Type check
npm run lint
```

## ⚠️ Important Disclaimer

### Segment Analysis Data

The **Segment Analysis** page contains **demo data for educational purposes only**. 

**For production use:**
- Replace with your own analytics data
- Conduct A/B tests to verify assumptions
- Reference verified statistics from trusted sources (Statista, eMarketer, Pew Research)
- See [SEGMENT_ANALYSIS_SOURCES.md](./SEGMENT_ANALYSIS_SOURCES.md) for detailed guidance

**The creators are not liable for business decisions made based on demo data.**

## 📝 License

Private

## 🤝 Contributing

This is a private project. For questions or issues, please contact the maintainers.
