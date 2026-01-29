# Deploying Postry AI to Vercel

## ✅ Ready for Deployment

Your project uses **Next.js API Routes** with a clean, single-app structure.

## 🚀 Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings ✓

### 3. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

**Where to find these:**

- **Supabase keys**: [Supabase Dashboard](https://app.supabase.com) → Project Settings → API
- **OpenAI key**: [OpenAI Platform](https://platform.openai.com/api-keys)

### 4. Deploy

Click "Deploy" - Vercel will:
- Install dependencies
- Build your Next.js app
- Deploy to production

## 📁 Project Structure

```
postry-ai/
├── src/
│   ├── app/
│   │   ├── api/v1/          # API Routes
│   │   ├── dashboard/       # Dashboard pages
│   │   └── auth/            # Auth pages
│   ├── components/          # React components
│   └── lib/                 # Utilities & helpers
├── supabase/               # Database schema
└── public/                 # Static assets
```

## 🗂️ API Routes

All endpoints are in `src/app/api/v1/`:

```
/api/v1/brands
  GET    - List all brands
  POST   - Create brand
  
/api/v1/brands/[id]
  GET    - Get single brand
  PUT    - Update brand
  DELETE - Delete brand

/api/v1/content
  GET    - List all content

/api/v1/content/generate
  POST   - Generate content from URL/text

/api/v1/content/[id]
  GET    - Get single content
  PUT    - Update content
  DELETE - Delete content

/api/v1/content/[id]/status
  PATCH  - Update content status

/api/v1/assets
  GET    - List all assets

/api/v1/assets/[id]/transcribe
  POST   - Transcribe audio/video

/api/v1/assets/[id]/generate
  POST   - Generate content from transcription

/api/v1/assets/[id]
  DELETE - Delete asset
```

## 🎯 Benefits

✅ **Single deployment** - No separate backend needed
✅ **Zero CORS issues** - Everything on one domain
✅ **Free hosting** - Vercel's hobby plan
✅ **Auto-scaling** - Vercel handles load
✅ **Simpler maintenance** - One codebase
✅ **Faster cold starts** - No separate server spin-up

## 🧪 Testing Locally

```bash
# Install dependencies
yarn install

# Add environment variables to .env.local
# (Copy from .env.example)

# Run development server
yarn dev
```

The API will be available at `http://localhost:3000/api/v1/*`

## ⚠️ Important Notes

1. **Clean structure** - Single Next.js app at root
2. **No API rewrites needed** - Direct API routes work automatically
3. **Environment variables** - Make sure to add ALL variables in Vercel dashboard

## 🔒 Security

- Service role key is server-side only (never exposed to client)
- OpenAI key is server-side only
- User authentication via Supabase JWT tokens
- All routes protected with auth middleware

## 📊 Monitoring

After deployment, monitor:
- Vercel Analytics (built-in)
- Vercel Logs for API errors
- OpenAI usage dashboard
- Supabase usage metrics

## 🆘 Troubleshooting

**Build fails?**
- Check all environment variables are set
- Verify Node.js version ≥18

**API returns 500?**
- Check Vercel function logs
- Verify environment variables are correct
- Check OpenAI API key has credits

**Authentication fails?**
- Verify Supabase keys are correct
- Check Supabase URL includes https://

---

**Ready to deploy!** 🚀
