# Command Centre - Next.js Goal Tracking Template

A modern, orange and white themed Next.js 14 template designed for building goal-tracking applications, featuring a stunning landing page, seamless Google authentication, and an all-in-one dashboard to monitor goals, action steps, and daily streaks.

## 🚀 Live Demo

[Link to your deployed demo] - Coming soon!

## 📸 Screenshots

- Landing Page: Beautifully designed homepage with orange and white theme
- Authentication: Seamless Google sign-in/sign-up with email/password options
- Dashboard: Comprehensive view of goals, action steps, and streaks

## ✨ Core Features

### Modern Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS for utility-first and fully responsive design
- **UI Components**: Custom-built components with Radix UI primitives
- **Authentication**: Firebase Authentication with Google OAuth and Email/Password
- **Database**: Cloud Firestore for real-time data storage

### Visually Appealing Design
- Clean and vibrant orange and white color scheme
- Professionally designed and fully responsive landing page
- Modern UI components with smooth animations and transitions

### Authentication
- Secure user authentication powered by Firebase
- Integrated Sign up/Sign in with Google for frictionless onboarding
- Email/password authentication option
- Protected routes ensuring only authenticated users access the dashboard

### All-in-One Dashboard
- **Goal Management**: Create, view, update, and delete personal/professional goals
- **Action Steps**: Define and track actionable steps for each goal
- **Streak Tracker**: Visual component showing current and longest streaks
- **Progress Analytics**: Visual progress indicators and completion percentages
- **Centralized View**: All key metrics organized on a single dashboard
- **Real-time Updates**: Changes sync instantly across all devices

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account (free tier available)
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
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Firebase Setup
Please see [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed Firebase configuration instructions.

### 5. Run the Development Server
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
│   ├── auth/                   # Authentication components
│   ├── providers/              # Context providers (Auth)
│   └── ui/                    # Reusable UI components
└── lib/
    ├── firebase.ts           # Firebase configuration
    ├── goalsService.ts      # Firestore service layer
    └── utils.ts             # Utility functions
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

### Firebase Hosting (Recommended)
1. Build your app: `npm run build`
2. Deploy: `firebase deploy`

### Vercel
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

- [ ] Real-time collaboration features
- [ ] Goal sharing and social features
- [ ] Mobile app with React Native
- [ ] Advanced analytics and reporting
- [ ] Goal templates and recommendations
- [ ] Push notifications
- [ ] Data export functionality
- [ ] Offline support enhancements

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Authentication by [Firebase](https://firebase.google.com/)
- Database by [Cloud Firestore](https://firebase.google.com/products/firestore)

---

**Command Centre** - Transform your aspirations into achievements! 🎯
