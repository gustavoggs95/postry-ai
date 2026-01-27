# Postry AI 🚀

**Multimodal Content Orchestrator** - Transform blog articles into multi-platform social content automatically.

![Postry AI](https://img.shields.io/badge/Postry-AI-8b5cf6?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge)

## ✨ Features

- **AI-Powered Content Generation** - Generate LinkedIn posts, TikTok scripts, and cover images from any blog URL
- **Brand Voice Presets** - Save your brand tone, style, and preferences for consistent content
- **Approval Workflow** - Draft → Approved → Published status with version control
- **Content Calendar** - Visual scheduling with drag-and-drop interface
- **Asset Transformation** - Upload videos and repurpose into multiple content formats

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Backend | Node.js, Express |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth + Google OAuth |
| AI | OpenAI GPT-4, DALL-E 3 |
| Package Manager | Yarn Workspaces |
| Code Quality | ESLint, Prettier |

## 📁 Project Structure

```
postry-ai/
├── apps/
│   ├── frontend/          # Next.js application
│   │   ├── src/
│   │   │   ├── app/       # App Router pages
│   │   │   ├── components/# React components
│   │   │   └── lib/       # Utilities & Supabase clients
│   │   └── ...
│   └── backend/           # Express API server
│       ├── src/
│       │   ├── routes/    # API routes
│       │   ├── middleware/# Auth & error handling
│       │   └── lib/       # Supabase & OpenAI clients
│       └── ...
├── packages/              # Shared packages (future)
├── supabase/
│   └── schema.sql         # Database schema
└── PROGRESS.md            # Development progress tracker
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Yarn
- Supabase account
- OpenAI API key

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/postry-ai.git
cd postry-ai
yarn install
```

### 2. Environment Setup

**Frontend** (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend** (`apps/backend/.env`):
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the schema in `supabase/schema.sql` in the SQL Editor
3. Enable Google OAuth in Authentication → Providers

### 4. Run Development Servers

```bash
# Run both frontend and backend
yarn dev

# Or run separately
yarn dev:frontend  # http://localhost:3000
yarn dev:backend   # http://localhost:5000
```

## 📝 API Endpoints

### Health
- `GET /api/v1/health` - Health check

### Authentication
- `GET /api/v1/me` - Get current user (protected)

### Brands
- `GET /api/v1/brands` - List brands
- `POST /api/v1/brands` - Create brand
- `GET /api/v1/brands/:id` - Get brand
- `PUT /api/v1/brands/:id` - Update brand
- `DELETE /api/v1/brands/:id` - Delete brand

### Content
- `GET /api/v1/content` - List content
- `POST /api/v1/content/generate` - Generate content
- `GET /api/v1/content/:id` - Get content
- `PUT /api/v1/content/:id` - Update content
- `PATCH /api/v1/content/:id/status` - Update status
- `DELETE /api/v1/content/:id` - Delete content

## 🎨 Theme

The application uses a modern dark theme with:

- **Primary**: Purple (#8b5cf6)
- **Accent**: Cyan (#06b6d4)
- **Background**: Dark (#0a0a0f)
- **Cards**: Elevated dark (#18181b)

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ using AI-powered development
