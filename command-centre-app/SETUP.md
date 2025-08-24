# Quick Setup Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment Variables
```bash
cp .env.local.template .env.local
```

Then edit `.env.local` with your actual values:
- Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
- Generate a secure NextAuth secret (you can use: `openssl rand -base64 32`)

### 3. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
npm start
```

## 📁 Key Files
- `/src/app/page.tsx` - Landing page
- `/src/app/dashboard/page.tsx` - Main dashboard
- `/src/app/auth/` - Authentication pages
- `/src/components/ui/` - Reusable UI components
- `/src/lib/utils.ts` - Utility functions

## 🎨 Customization
- Colors are defined in `/src/app/globals.css`
- UI components can be modified in `/src/components/ui/`
- Add new pages in `/src/app/`

## 🚀 Deployment
Deploy easily on Vercel, Netlify, or any platform supporting Next.js.

Remember to set your environment variables in your deployment platform!
