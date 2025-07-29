# Voice LMS - AI-Powered Voice Learning Platform

A modern Learning Management System that leverages voice interaction and AI to create personalized tutoring experiences. Learn through natural conversation with AI companions across various subjects.


## 🚀 Features

### 🎯 Core Functi## 🤖 Automated Database Management

This project includes a simple GitHub Actions workflow that automatically pings your deployed application every 3 days to keep the Supabase database active (prevents free tier from pausing due to inactivity).lity
- **Voice-Based Learning**: Learn through natural conversation using speech recognition and synthesis
- **AI Tutoring**: Personalized AI companions powered by Google Gemini Flash 1.5
- **Multiple Subjects**: Mathematics, Science, Language, History, Coding, Economics, and more
- **Real-time Interaction**: Live speech recognition with instant AI responses
- **Session Management**: Track your learning progress and session history

### 🎨 User Experience
- **Companion Builder**: Create custom AI tutors with personalized names, subjects, and teaching styles
- **Voice Customization**: Choose between male/female voices and formal/casual teaching styles
- **Interactive Sessions**: Visual feedback with animated speech indicators and real-time transcripts
- **Responsive Design**: Optimized for desktop and mobile devices
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS and Radix UI

### 📊 Learning Management
- **Progress Tracking**: Monitor your learning journey and session history
- **Bookmarking**: Save favorite companions for quick access
- **Subject Filtering**: Browse companions by subject categories
- **Search Functionality**: Find specific topics and companions
- **Session Duration**: Flexible learning sessions from 15-60 minutes
- **Companion Management**: Create, edit, and delete your AI tutors
- **User Dashboard**: Centralized view of your learning activity

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Lottie React** - Animations for visual feedback
- **React Hook Form** - Form management with Zod validation

### Backend & Database
- **Supabase** - PostgreSQL database and real-time features
- **Server Actions** - Next.js server-side data handling
- **Database Tables**:
  - `companions` - AI tutor configurations
  - `session_history` - Learning session tracking
  - `users` - User profiles and preferences

### Authentication
- **Clerk** - Complete authentication solution
- **Protected Routes** - Secure user areas
- **User Management** - Profile management and session handling

### AI & Voice Technology
- **Google Gemini Flash 1.5** - Advanced AI conversation model
- **Browser Speech Recognition** - Native speech-to-text
- **Browser Speech Synthesis** - Native text-to-speech
- **Custom Voice AI Service** - Orchestrates voice interactions

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **Vercel** - Deployment and hosting
- **Git** - Version control
- **GitHub Actions** - Automated database keep-alive

## 📋 Prerequisites

- **Node.js** 18+ and pnpm
- **Modern Browser** (Chrome, Edge, Safari recommended)
- **Microphone** access for voice features
- **Google AI API Key**
- **Supabase Account**
- **Clerk Account**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Sarcastic-Soul/Voice-LMS.git
cd Voice-LMS
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Google AI Services
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 4. Database Setup (Supabase)

Create the following tables in your Supabase database:

#### Companions Table
```sql
CREATE TABLE companions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  voice TEXT NOT NULL,
  style TEXT NOT NULL,
  duration INTEGER NOT NULL,
  author TEXT NOT NULL,
  isBookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### Session History Table
```sql
CREATE TABLE session_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  companion_id UUID REFERENCES companions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

### 5. Authentication Setup (Clerk)

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Configure sign-in/sign-up components
3. Add your Clerk keys to the environment file
4. Enable Google OAuth (optional)

### 5. AI Service Setup (Google Gemini)

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to `NEXT_PUBLIC_GEMINI_API_KEY`

### 6. GitHub Secrets (for Database Keep-Alive)

Add this secret to your GitHub repository for the automated database ping workflow:

1. Go to your GitHub repository settings
2. Navigate to Secrets and Variables → Actions
3. Add the following secret:
   - `WEBSITE_URL`: Your deployed application URL (e.g., `https://your-app.vercel.app`)

### 7. Run Development Server
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🏗️ Project Structure

```
Voice-LMS/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── companions/        # Companion management pages
│   ├── dashboard/         # Main dashboard
│   ├── my-journey/        # User progress tracking
│   └── sign-in|sign-up/   # Authentication pages
├── components/            # Reusable UI components
│   ├── ui/               # Radix UI components
│   ├── CompanionCard.tsx # Companion display card
│   ├── CompanionForm.tsx # Companion creation form
│   └── CompanionComponent.tsx # Main voice interaction
├── lib/                   # Utility libraries
│   ├── actions/          # Server actions
│   ├── hooks/            # Custom React hooks
│   ├── services/         # AI and voice services
│   ├── supabase.ts       # Database client
│   └── utils.ts          # Helper functions
├── types/                # TypeScript definitions
├── constants/            # App constants and data
└── public/               # Static assets
```

## 🎮 Usage Guide

### Creating Your First Companion

1. **Sign In**: Create an account or sign in
2. **Navigate**: Go to "Companions" → "New Companion"
3. **Configure**: Fill out the companion form:
   - **Name**: Give your AI tutor a name
   - **Subject**: Choose from available subjects
   - **Topic**: Describe what you want to learn
   - **Voice**: Select male/female voice
   - **Style**: Choose formal/casual teaching approach
   - **Duration**: Set expected session length

### Managing Your Companions

1. **View All**: Go to "Manage" to see all your created companions
2. **Delete**: Click the trash icon to remove unwanted companions
3. **Confirm**: Confirm deletion in the modal dialog
4. **Note**: Deleting a companion also removes its session history

### Starting a Learning Session

1. **Select**: Choose a companion from your library
2. **Launch**: Click "Launch Lesson"
3. **Begin**: Click "Start Session" to begin voice interaction
4. **Interact**: Speak naturally - the AI will respond with voice
5. **Control**: Use microphone button to mute/unmute
6. **End**: Click "End Session" when finished

### Managing Your Learning

- **Dashboard**: View popular companions and recent sessions
- **My Journey**: Track your progress and session history
- **Bookmarks**: Save favorite companions for quick access
- **Search & Filter**: Find specific topics or subjects
- **Manage Companions**: View, edit, and delete your created companions

## 🔧 Browser Compatibility

### Fully Supported
- ✅ **Chrome/Chromium** (Recommended)
- ✅ **Microsoft Edge**
- ✅ **Safari** (macOS/iOS)

### Limited Support
- ⚠️ **Firefox** (Speech recognition may not work)

### Required Permissions
- **Microphone Access**: For speech recognition
- **Audio Playback**: For text-to-speech responses

## 🐛 Troubleshooting

### Speech Recognition Issues
- Ensure you're using a supported browser
- Check microphone permissions in browser settings
- Verify microphone is working in other applications
- Try refreshing the page

### Voice Synthesis Problems
- Confirm browser supports Speech Synthesis API
- Check system audio settings
- Try different voice options
- Clear browser cache

### AI Response Issues
- Verify Gemini API key is valid and active
- Check API quota limits
- Ensure stable internet connection
- Review browser console for error messages

### Authentication Problems
- Verify Clerk configuration
- Check environment variables
- Clear browser cookies and cache
- Ensure correct redirect URLs

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with automatic CI/CD

### Manual Deployment
```bash
pnpm build
pnpm start
```

## � Automated Database Management

This project includes a GitHub Actions workflow that automatically pings the Supabase database every 3 days to prevent it from pausing due to inactivity (common with Supabase free tier).

### How It Works
- **Simple HTTP Requests**: Just pings your deployed website URL
- **Scheduled Execution**: Runs every 3 days at 12:00 UTC
- **Manual Trigger**: Can be manually triggered from GitHub Actions tab
- **Fallback Logic**: Tries homepage first, then API endpoints if needed
- **No Dependencies**: Uses only built-in curl commands

### Setup Requirements
1. Add your deployed website URL to GitHub repository secrets:
   - `WEBSITE_URL` (e.g., `https://your-app.vercel.app`)
2. Ensure GitHub Actions are enabled for your repository
3. The workflow will automatically start running on the scheduled interval

### Manual Execution
To manually trigger the database ping:

**Via GitHub Actions:**
1. Go to your repository's "Actions" tab
2. Select "Keep Database Active" workflow
3. Click "Run workflow" → "Run workflow"

**Via Local Script:**
```bash
# Using environment variable
WEBSITE_URL=https://your-app.vercel.app pnpm run ping-db

# Using command line argument
pnpm run ping-db https://your-app.vercel.app
```

## �🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint configuration
- Write descriptive commit messages
- Test voice features across browsers
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Google Gemini** for advanced AI capabilities
- **Supabase** for reliable database and real-time features
- **Clerk** for seamless authentication
- **Vercel** for excellent deployment platform
- **Radix UI** for accessible component library

---

**Built with ❤️ for the future of education**
