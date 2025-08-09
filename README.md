# English Practice App

A modern React TypeScript application for improving English listening, dictation, and shadowing skills. Built with the latest React 18, TypeScript, Tailwind CSS, and Supabase for authentication and data management.

## Features

### 🔐 Authentication & Social Login
- **Email/Password Authentication** - Traditional signup and login
- **Social Login** - Sign in with Google, GitHub, and Facebook
- **Email Confirmation** - Custom email templates for account verification
- **Secure Session Management** - Automatic token refresh and session persistence

### 🎵 Audio Support
- Import MP3, WAV, OGG, M4A audio files from local storage
- Advanced audio player with play/pause, seek, and volume controls
- Real-time audio synchronization with subtitles

### 📝 Subtitle Support
- Automatic detection of .srt and .vtt subtitle files
- Manual subtitle file upload from any location
- Folder upload support for batch processing
- Real-time subtitle parsing and synchronization

### 🎯 Three Practice Modes

#### 1. Listening Mode
- View all subtitles in a scrollable list
- Current sentence highlighting
- Click to jump to specific timestamps
- Visual progress indicators

#### 2. Dictation Mode
- Focus on one sentence at a time
- Type what you hear after listening
- Real-time feedback on accuracy
- Show/hide correct answers
- Navigate between sentences

#### 3. Shadowing Mode
- Record your pronunciation for each sentence
- Play back your recordings
- Compare with original audio
- Manage recordings (play, delete)
- Practice pronunciation improvement

### 📚 Playlist Management
- Create and manage personal playlists
- Organize audio files by categories
- Share playlists with other users
- Public, protected, and private playlist visibility

## Technology Stack

- **React 18** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend-as-a-Service for authentication and database
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **Web Vitals** - Performance monitoring
- **Modern ES6+** - Latest JavaScript features

## Performance Optimizations

- React.memo for component memoization
- useCallback for stable function references
- Lazy loading of components
- Optimized re-renders
- Efficient state management with Zustand
- Modern CSS with Tailwind

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd english-practice-simple
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_REDIRECT_URL=http://localhost:3000/auth/callback
```

5. Set up Supabase:
   - Create a new Supabase project
   - Configure authentication providers (Google, GitHub, Facebook)
   - Set up email templates
   - Configure redirect URLs

6. Start the development server:
```bash
npm start
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Supabase Setup

#### 1. Authentication Configuration
- Enable Email/Password authentication
- Configure social login providers (Google, GitHub, Facebook)
- Set up custom email templates
- Configure redirect URLs

#### 2. Database Setup
Run the SQL scripts in the `scripts/` folder:
```bash
# Setup database tables
psql -h your-project.supabase.co -U postgres -d postgres -f scripts/setup-database.sql

# Setup storage buckets
psql -h your-project.supabase.co -U postgres -d postgres -f scripts/setup-storage.sql
```

#### 3. Email Template Configuration
See `EMAIL_TEMPLATE_SETUP.md` for detailed instructions on customizing email templates.

### Building for Production

```bash
npm run build
```

## Usage

### Authentication
1. **Sign Up**: Create an account with email/password or social login
2. **Email Confirmation**: Verify your email address
3. **Sign In**: Login with your credentials or social providers
4. **Profile Management**: Update your profile information

### Audio Practice
1. **Upload Audio File**: Click "Select Audio File" to upload an MP3 or other audio format
2. **Upload Subtitle** (Optional): Upload a .srt or .vtt file with the same name as your audio file
3. **Choose Practice Mode**: Switch between Listening, Dictation, and Shadowing modes
4. **Practice**: Use the audio controls and practice interface to improve your skills

### Playlist Management
1. **Create Playlist**: Organize your audio files into playlists
2. **Set Visibility**: Choose public, protected, or private visibility
3. **Share**: Share your playlists with other users
4. **Practice**: Access your playlists for focused practice sessions

## File Format Support

### Audio Formats
- MP3
- WAV
- OGG
- M4A

### Subtitle Formats
- SRT (SubRip)
- VTT (WebVTT)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── AudioPlayer.tsx
│   ├── FileUpload.tsx
│   ├── ListeningMode.tsx
│   ├── DictationMode.tsx
│   ├── ShadowingMode.tsx
│   ├── SocialLoginButtons.tsx
│   └── ProtectedRoute.tsx
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── AuthCallbackPage.tsx
│   ├── HomePage.tsx
│   └── PlaylistPage.tsx
├── store/              # State management
│   ├── useAuthStore.ts
│   ├── useAppStore.ts
│   └── usePlaylistStore.ts
├── lib/                # External libraries
│   └── supabase.ts
├── utils/              # Utility functions
│   ├── subtitleParser.ts
│   └── cn.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

### Key Features Implementation

- **Authentication**: Supabase Auth with social login support
- **Audio Synchronization**: Real-time audio and subtitle synchronization
- **File Processing**: Automatic subtitle detection and parsing
- **Recording API**: Browser MediaRecorder API for shadowing mode
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **State Management**: Zustand for efficient state management

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL | Yes |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `REACT_APP_REDIRECT_URL` | OAuth redirect URL | Yes |
| `REACT_APP_DEBUG` | Enable debug mode | No |

### Social Login Setup

See `EMAIL_TEMPLATE_SETUP.md` for detailed instructions on setting up:
- Google OAuth
- GitHub OAuth  
- Facebook OAuth
- Email templates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub. 