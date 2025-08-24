# Command Centre - Next.js Goal Tracking Template

A modern, orange and white themed Next.js 14 template designed for building goal-tracking applications, featuring a stunning landing page, seamless Google authentication, and an all-in-one dashboard to monitor goals, action steps, and daily streaks.

## 🚀 Live Demo

[Link to your deployed demo] - Coming soon!

## 📸 Screenshots

- Landing Page: Beautifully designed homepage with orange and white theme
- Authentication: Seamless Google sign-in/sign-up modal
- Dashboard: Comprehensive view of goals, action steps, and streaks

## ✨ Core Features

### Modern Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS for utility-first and fully responsive design
- **UI Components**: Custom-built components with Radix UI primitives
- **Authentication**: Supabase Authentication with Google OAuth

### Visually Appealing Design
- Clean and vibrant orange and white color scheme
- Professionally designed and fully responsive landing page
- Modern UI components with smooth animations and transitions

### Authentication
- Secure user authentication powered by Supabase
- Integrated Sign up/Sign in with Google for frictionless onboarding
- Protected routes ensuring only authenticated users access the dashboard

### All-in-One Dashboard
- **Goal Management**: Create, view, update, and delete personal/professional goals
- **Action Steps**: Define and track actionable steps for each goal
- **Streak Tracker**: Visual component showing current and longest streaks
- **Progress Analytics**: Visual progress indicators and completion percentages
- **Centralized View**: All key metrics organized on a single dashboard

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available)
- Google Cloud Console account (for OAuth)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd command-centre-app
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Configure your environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Supabase Setup
1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to Settings > API to get your project URL and anon key
3. Go to Authentication > Providers > Google and enable Google provider
4. Add your Google OAuth credentials from Google Cloud Console
5. Configure authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

### 5. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Use the redirect URIs from your Supabase setup

### 6. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/
│   ├── auth/                      # Authentication pages
│   ├── dashboard/                 # Main dashboard page
│   ├── globals.css               # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                # Landing page
├── components/
│   ├── providers/              # Context providers (Auth)
│   └── ui/                    # Reusable UI components
└── lib/
    ├── supabaseClient.ts     # Supabase client configuration
    └── utils.ts              # Utility functions
```

## 🎨 Customization

### Colors
The orange and white theme is defined in `globals.css`. Customize the color palette by modifying the CSS custom properties:

```css
:root {
  --primary: #ea5734;        /* Main orange color */
  --primary-dark: #d9471f;   /* Darker orange for hovers */
  --secondary: #f97316;      /* Secondary orange */
  --accent: #fff7ed;         /* Light orange accent */
  /* ... */
}
```

### Components
All UI components are built with Tailwind CSS and can be easily customized by modifying the classes in each component file.

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The application can be deployed on any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🔮 Future Enhancements

- [ ] Database integration with Prisma
- [ ] Goal sharing and collaboration
- [ ] Mobile app with React Native
- [ ] Advanced analytics and reporting
- [ ] Goal templates and recommendations
- [ ] Notification system
- [ ] Data export functionality

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Authentication by [Supabase](https://supabase.com/)

---

**Command Centre** - Transform your aspirations into achievements! 🎯
