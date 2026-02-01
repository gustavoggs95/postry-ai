# Postry AI 🚀

**AI-Powered Content Factory** - Transform blog articles and videos into multi-platform social content automatically.

![Postry AI](https://img.shields.io/badge/Postry-AI-8b5cf6?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge)

🌐 **Live Demo:** https://postry-ai.vercel.app/

## ✨ Features

- **AI-Powered Content Generation** - Generate LinkedIn posts, TikTok scripts, Twitter threads, and Instagram posts from any blog URL
- **Brand Voice Presets** - Save your brand tone, style, and preferences for consistent content across all platforms
- **Approval Workflow** - Draft → Approved → Archived status with full version tracking
- **Content Calendar** - Visual scheduling with drag-and-drop interface (coming soon)
- **Asset Transformation** - Upload videos, get transcriptions, and repurpose into tweets, blogs, and Reels
- **AI Model Selection** - GPT-5 Mini, or GPT-5 Nano for quality vs. cost optimization

## 🛠️ Tech Stack

| Layer           | Technology                       |
| --------------- | -------------------------------- |
| Framework       | Next.js 16.1 (App Router)        |
| Language        | TypeScript 5.8                   |
| Styling         | Tailwind CSS 3.4                 |
| Database        | Supabase (PostgreSQL)            |
| Authentication  | Supabase Auth + Google OAuth     |
| AI              | OpenAI GPT-5.x, DALL-E 3         |
| Storage         | Supabase Storage (videos/images) |
| Deployment      | Vercel                           |
| Package Manager | Yarn                             |
| Code Quality    | ESLint 9.27, Prettier 3.5        |

## 📁 Project Structure

```
postry-ai/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/v1/              # API routes
│   │   │   ├── assets/          # Asset management & transcription
│   │   │   ├── brands/          # Brand presets CRUD
│   │   │   └── content/         # Content generation & management
│   │   ├── auth/                # Authentication pages
│   │   │   ├── callback/        # OAuth callback handler
│   │   │   └── page.tsx         # Login/signup page
│   │   ├── dashboard/           # Protected dashboard
│   │   │   ├── assets/          # Asset library
│   │   │   ├── brands/          # Brand management
│   │   │   ├── calendar/        # Content calendar
│   │   │   ├── content/         # Content library
│   │   │   └── generate/        # Content generation
│   │   ├── page.tsx             # Landing page
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/              # Shared React components
│   │   ├── AuthModal.tsx
│   │   ├── ContentCard.tsx
│   │   ├── DashboardLayoutClient.tsx
│   │   └── UserDropdown.tsx
│   └── lib/                     # Utilities & clients
│       ├── supabase/            # Supabase client configs
│       │   ├── client.ts        # Browser client
│       │   ├── server.ts        # Server client
│       │   ├── middleware.ts    # Middleware client
│       │   └── admin.ts         # Admin client
│       ├── stores/              # Zustand state management
│       │   ├── auth-store.ts
│       │   ├── brand-store.ts
│       │   └── content-store.ts
│       ├── openai.ts            # OpenAI client
│       └── utils.ts             # Utility functions
├── supabase/
│   └── schema.sql               # Database schema
├── public/
│   └── images/                  # Static assets (logos, favicon)
├── .env.local                   # Local environment variables
├── .env.production              # Production environment template
└── vercel.json                  # Vercel deployment config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Yarn
- Supabase account
- OpenAI API key (GPT-5 access)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/postry-ai.git
cd postry-ai
yarn install
```

### 2. Environment Setup

Create `.env.local`:

```env
# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the schema in `supabase/schema.sql` in the SQL Editor
3. Enable Google OAuth in Authentication → Providers
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.vercel.app/auth/callback`

### 4. Run Development Server

```bash
yarn dev
# Open http://localhost:3000
```

## 📝 API Routes

### Content Generation

- `POST /api/v1/content/generate` - Generate content from URL
  - Body: `{ url?, text?, brandId, contentTypes, generateImage?, model? }`
  - Models: `gpt-5-mini`, `gpt-5-nano`

### Content Management

- `GET /api/v1/content` - List all content (filtered by user)
- `GET /api/v1/content/:id` - Get content details
- `PUT /api/v1/content/:id` - Update content
- `PATCH /api/v1/content/:id/status` - Update content status
  - Body: `{ status: 'draft' | 'approved' | 'archived' }`
- `DELETE /api/v1/content/:id` - Delete content

### Brands

- `GET /api/v1/brands` - List all brand presets
- `POST /api/v1/brands` - Create brand preset
  - Body: `{ name, voice_description, logo_url?, primary_color?, secondary_color? }`
- `GET /api/v1/brands/:id` - Get brand details
- `PUT /api/v1/brands/:id` - Update brand
- `DELETE /api/v1/brands/:id` - Delete brand

### Assets

- `GET /api/v1/assets` - List all assets (videos/images)
- `GET /api/v1/assets/:id` - Get asset details
- `POST /api/v1/assets/:id/transcribe` - Transcribe video asset
- `POST /api/v1/assets/:id/generate` - Generate content from transcription
  - Body: `{ brandId?, formats?, model? }`
- `PUT /api/v1/assets/:id` - Update asset metadata
- `DELETE /api/v1/assets/:id` - Delete asset

## 🎨 Design System

The application uses a modern dark theme with animated backgrounds:

- **Primary**: Purple (#8b5cf6)
- **Accent**: Cyan (#06b6d4)
- **Background**: Dark gradient (#0a0a0f)
- **Cards**: Elevated dark (#18181b)
- **Effects**: Animated gradient orbs with grid pattern overlay

## 🚢 Deployment

### Vercel

1. Connect your GitHub repo to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
3. Deploy!

### Supabase Configuration

- Add production URL to redirect URLs in Authentication settings
- Add wildcard for preview deployments: `https://*.vercel.app/auth/callback`

## 📄 License

MIT License - feel free to use this project for your own purposes.
