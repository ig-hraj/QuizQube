
# 🎓 QuizQube
**An AI-powered quiz generation platform that transforms your study materials into interactive learning experiences.**
---

## 📚 About

QuizQube is a full-stack web application that leverages AI to automatically generate comprehensive quizzes from uploaded documents. Perfect for students, educators, and lifelong learners who want to create engaging study materials without manual effort.

Simply upload your PDFs, let our AI analyze the content, customize your quiz preferences, and start learning immediately with interactive quizzes and detailed performance metrics.

---

## ✨ Features

### 📤 Document Management
- **Upload Multiple Documents** - Support for up to 3 PDF files simultaneously
- **Local PDF Processing** - All document processing happens client-side (no server uploads)
- **Secure & Private** - Your documents never leave your browser

### 🤖 AI-Powered Quiz Generation
- **Smart Content Analysis** - Uses Groq's Llama 3.1 LLM to analyze document content
- **Customizable Quizzes** - Adjust number of questions, difficulty level, and quiz type
- **Multiple Question Types** - Multiple choice, true/false, short answer formats
- **Context-Aware** - Questions are generated based on the actual content of your documents

### 📊 Interactive Learning
- **Real-time Quiz Experience** - Smooth, animated quiz interface
- **Instant Feedback** - Immediate results with correct answers highlighted
- **Performance Analytics** - Track quiz history and learning progress
- **Personalized Settings** - Save your preferences for consistent experience

### 🔐 User Management
- **Google Authentication** - Sign in securely with your Google account via Clerk
- **User Profiles** - Personalized dashboard with usage statistics
- **Local Storage** - API keys stored securely in browser local storage
- **Settings Dashboard** - Manage preferences and quiz configurations

### 💬 Bonus Features
- **Academic Chat** - Chat with AI assistant for academic discussions
- **User Statistics** - Track documents uploaded, quizzes taken, and completion rates
- **Responsive Design** - Seamless experience on desktop and mobile devices

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **[Next.js 14](https://nextjs.org/)** | React framework with SSR, API routes, and optimizations |
| **[React 18](https://reactjs.org/)** | UI library and component framework |
| **[TypeScript](https://www.typescriptlang.org/)** | Static typing for safer code |
| **[Tailwind CSS](https://tailwindcss.com/)** | Utility-first CSS for rapid UI development |
| **[Shadcn UI](https://ui.shadcn.com/)** | Pre-built, customizable components |
| **[Framer Motion](https://www.framer.com/motion/)** | Smooth animations and transitions |
| **[Lucide React](https://lucide.dev/)** | Beautiful, consistent icon library |

### Backend & Services
| Technology | Purpose |
|-----------|---------|
| **[Clerk](https://clerk.com/)** | Modern authentication with Google OAuth 2.0 |
| **[Groq API](https://console.groq.com/)** | Fast LLM inference (Llama 3.1) for quiz generation |
| **[PDF-Parse](https://www.npmjs.com/package/pdf-parse)** | PDF file parsing and text extraction |

### Development
| Technology | Purpose |
|-----------|---------|
| **[TypeScript](https://www.typescriptlang.org/)** | Type safety and better DX |
| **[ESLint](https://eslint.org/)** | Code quality and consistency |
| **[PostCSS](https://postcss.org/)** | CSS transformations |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Clerk** account (free at [clerk.com](https://clerk.com))
- **Groq** account (free at [console.groq.com](https://console.groq.com))

### Installation & Setup

#### 1️⃣ Clone & Install
```bash
git clone https://github.com/yourusername/QuizQube.git
cd QuizQube
npm install
```

#### 2️⃣ Set Up Authentication (Clerk)
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click **Create Application**
3. Enable **Google** as a sign-in provider
4. Copy your authentication keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Public key)
   - `CLERK_SECRET_KEY` (Secret key)

#### 3️⃣ Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx...
CLERK_SECRET_KEY=sk_test_xxxxx...
```

**Environment Variables Details:**
```env
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_public_key
CLERK_SECRET_KEY=your_secret_key

# Clerk Redirect URLs (Already configured)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home
```

#### 4️⃣ Get Groq API Key
1. Visit [Groq Console](https://console.groq.com/api-keys)
2. Click **Create New API Key**
3. Copy the API key
4. In the app, go to **Settings → Groq API Key** and paste it
   - ⚠️ The key is stored in browser local storage for convenience

#### 5️⃣ Run the Application
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser

---

## 📁 Project Structure

```
QuizQube/
├── app/
│   ├── api/                      # API routes
│   │   ├── chat/                 # Academic chat endpoint
│   │   ├── generateQuiz/         # Quiz generation endpoint
│   │   └── parsePdf/             # PDF parsing endpoint
│   ├── home/                     # Protected routes (require auth)
│   │   ├── chat/                 # Chat page
│   │   ├── settings/             # User settings page
│   │   ├── ChatContext.tsx       # Global chat state
│   │   ├── FileUploadContext.tsx # File upload state
│   │   ├── UserStatsContext.tsx  # User stats state
│   │   ├── FileUploader.tsx      # PDF upload component
│   │   └── ChatSidebar.tsx       # Chat history sidebar
│   ├── layout.tsx                # Root layout with Clerk provider
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── components/
│   ├── Navbar.tsx                # Navigation with user menu
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ... (other UI components)
│   └── card.tsx                  # Feature cards component
│
├── hooks/
│   └── use-toast.ts              # Toast notification hook
│
├── lib/
│   ├── utils.ts                  # Utility functions
│   └── normalizeText.ts          # Text normalization utilities
│
├── public/
│   ├── quizqube.svg              # Logo
│   └── quizqube_featured.png     # Feature image
│
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── next.config.mjs               # Next.js configuration
└── README.md                     # This file
```

---

## 🔄 How It Works

### Quiz Generation Flow

```
┌─────────────┐
│ User uploads│
│   3 PDFs    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  PDF Parsing (Local)│
│ Extract text content│
└──────┬──────────────┘
       │
       ▼
┌──────────────────────────┐
│  Send to Groq API        │
│ (Llama 3.1 LLM)          │
│ Analyze & Generate Quiz  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Customize Quiz Settings  │
│ • Questions count        │
│ • Difficulty level       │
│ • Question types         │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Take Interactive Quiz   │
│  • Answer questions      │
│  • Get instant feedback  │
│  • View results          │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Analytics & Progress    │
│  • Track performance     │
│  • View statistics       │
│  • Save quiz history     │
└──────────────────────────┘
```

### Key Processes

1. **PDF Processing**: Documents are parsed client-side using `pdf-parse`
2. **AI Analysis**: Content is sent to Groq's API for intelligent analysis
3. **Quiz Generation**: LLM generates contextual questions from document content
4. **User Authentication**: Secure login via Clerk's Google OAuth integration
5. **Data Persistence**: User preferences stored in browser local storage

---

## 📝 Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint for code quality
npm run lint
```

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

Vercel is the platform made by the creators of Next.js, offering the best experience:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

**Important**: Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### Deploy to Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New → Web Service**
4. Connect your GitHub repository
5. Set environment variables
6. Deploy

### Deploy to Other Platforms

QuizQube can be deployed to any platform supporting Node.js 18+:
- AWS Amplify
- Netlify
- Azure App Service
- Google Cloud Platform
- DigitalOcean App Platform

---

## 🔐 Security & Privacy

- ✅ **No document storage**: PDFs are processed locally and never saved
- ✅ **Encrypted authentication**: Google OAuth via Clerk
- ✅ **Client-side processing**: Sensitive operations happen in your browser
- ✅ **API key protection**: Never exposed in production code
- ✅ **HTTPS only**: All production deployments use secure connections

---

## 💡 Use Cases

- 📖 **Students**: Generate practice quizzes from lecture notes and textbooks
- 👨‍🏫 **Teachers**: Create assessments from educational materials quickly
- 💼 **Professionals**: Generate certification preparation quizzes
- 🎓 **Researchers**: Create comprehension tests from research papers
- 🌍 **Language Learners**: Build vocabulary and comprehension exercises

---

## 🚧 Future Improvements

- [ ] Support for additional document formats (DOCX, TXT, PPT)
- [ ] Timed quizzes with countdown timers
- [ ] Leaderboard and competitive features
- [ ] Quiz sharing and collaboration
- [ ] Advanced analytics and performance insights
- [ ] Audio/video content support
- [ ] Mobile app using React Native
- [ ] Offline mode capability
- [ ] Social sharing features
- [ ] Integration with learning management systems (LMS)

---

## 📚 Learning Outcomes

This project demonstrates expertise in:

- ✅ Full-stack development with Next.js 14
- ✅ Modern authentication patterns (OAuth 2.0 via Clerk)
- ✅ Integration with external AI/LLM APIs (Groq)
- ✅ State management with React Context API
- ✅ Responsive UI design with Tailwind CSS
- ✅ Animation and micro-interactions with Framer Motion
- ✅ Type safety with TypeScript
- ✅ Document processing and parsing
- ✅ File upload handling
- ✅ API route development in Next.js

---

## 🤝 Contributing

Contributions are welcome and appreciated! Here's how to contribute:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow existing code style and patterns
- Add TypeScript types for new code
- Update README if adding new features
- Test changes before submitting PR
- Write clear, descriptive commit messages

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Inspired by** [ExploreCarriers](https://github.com/Nutlope/explorecareers)
- **Built with** ❤️ using Next.js ecosystem
- **Powered by** [Groq](https://groq.com/) & [Llama 3.1](https://ai.meta.com/llama/)
- **Authentication** via [Clerk](https://clerk.com/)

---

## 📞 Support & Questions

- 📖 Check the [Getting Started](#-quick-start) section
- 🐛 Found a bug? Open an issue
- 💬 Have suggestions? Open a discussion
- 📧 For other inquiries, contact the maintainers

---

<div align="center">

**Made with ❤️ for the learning community**

If you found this useful, please consider giving it a ⭐

</div>