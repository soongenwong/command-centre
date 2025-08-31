# Firebase Migration Guide

This guide will help you migrate from Supabase to Firebase for authentication and database.

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter your project name (e.g., "command-centre")
4. Enable Google Analytics (optional)
5. Complete the setup

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Enable **Google** provider:
   - Click on Google
   - Enable it
   - Add your app's domain to authorized domains
   - Add your Google OAuth client credentials if you have them

### 3. Set up Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll add security rules later)
4. Select a location for your database

### 4. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Web app** icon (</>) to add a web app
4. Register your app with a name
5. Copy the configuration object

### 5. Configure Environment Variables

Create a `.env.local` file in your project root with your Firebase config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 6. Deploy Firestore Security Rules

Install Firebase CLI if you haven't already:
```bash
npm install -g firebase-tools
```

Login to Firebase:
```bash
firebase login
```

Initialize Firebase in your project:
```bash
firebase init
```
- Select **Firestore** and **Hosting**
- Choose your existing project
- Accept default file names for Firestore rules and indexes
- Choose **out** as your public directory for hosting

Update your `.firebaserc` file with your project ID:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

Deploy the security rules:
```bash
firebase deploy --only firestore:rules
```

### 7. Data Migration (Optional)

If you have existing data in Supabase, you'll need to export it and import it into Firestore. The data structure is compatible, but you'll need to:

1. Export data from Supabase
2. Transform it to Firestore format
3. Import using Firebase Admin SDK or the Firebase console

## Key Changes Made

### Authentication
- Replaced Supabase Auth with Firebase Authentication
- Updated AuthProvider to use Firebase's `onAuthStateChanged`
- Created new sign-in forms with email/password and Google OAuth

### Database
- Replaced Supabase client with Firestore
- Updated GoalsService to use Firestore collections and documents
- Implemented proper security rules in `firestore.rules`

### File Structure
```
src/
├── lib/
│   ├── firebase.ts          # Firebase configuration
│   ├── goalsService.ts      # Updated to use Firestore
│   └── supabaseClient.ts    # Now exports Firebase clients
├── components/
│   ├── auth/
│   │   └── sign-in-form.tsx # New Firebase auth form
│   └── providers/
│       └── auth-provider.tsx # Updated for Firebase
└── app/
    └── auth/
        ├── signin/page.tsx  # Updated for Firebase
        └── signup/page.tsx  # Updated for Firebase
```

### Security Rules
The Firestore security rules ensure:
- Users can only access their own goals
- Action steps and completed dates are accessible only through their associated goals
- All operations require authentication

## Testing

1. Start your development server: `npm run dev`
2. Create a test account using email/password or Google sign-in
3. Try creating goals, action steps, and marking them complete
4. Verify that data is properly saved and retrieved from Firestore

## Deployment

For production deployment:

1. Build your Next.js app: `npm run build`
2. Deploy to Firebase Hosting: `firebase deploy`

Or deploy to your preferred hosting platform with the environment variables configured.

## Benefits of Firebase

- **Real-time capabilities**: Firestore provides real-time updates
- **Offline support**: Works offline by default
- **Scalability**: Automatically scales with your user base
- **Security**: Robust security rules engine
- **Integration**: Seamless integration with other Google Cloud services
- **Analytics**: Built-in analytics and performance monitoring
