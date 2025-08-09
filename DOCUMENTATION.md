# English Practice App - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Core Features](#core-features)
5. [State Management](#state-management)
6. [Component Architecture](#component-architecture)
7. [Practice Modes](#practice-modes)
8. [Audio Processing](#audio-processing)
9. [Subtitle System](#subtitle-system)
10. [File Management](#file-management)
11. [Keyboard Shortcuts](#keyboard-shortcuts)
12. [Performance Optimizations](#performance-optimizations)
13. [Development Guide](#development-guide)
14. [API Reference](#api-reference)
15. [Troubleshooting](#troubleshooting)

## Project Overview

The English Practice App is a comprehensive React TypeScript application designed to help users improve their English listening, dictation, and shadowing skills. The app provides an interactive learning environment with synchronized audio and subtitle support across three distinct practice modes.

### Key Objectives
- **Listening Comprehension**: View synchronized subtitles while listening to audio
- **Dictation Practice**: Type what you hear with real-time feedback
- **Shadowing Practice**: Record and compare pronunciation with original audio
- **Flexible Learning**: Support for various audio formats and subtitle files
- **Personalized Experience**: Per-sentence speed and volume controls

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Pages: HomePage, PlaylistPage, AudioPlayerPage, etc.     │
├─────────────────────────────────────────────────────────────┤
│                  Component Layer                           │
├─────────────────────────────────────────────────────────────┤
│  AudioPlayer, ListeningMode, DictationMode, ShadowingMode │
├─────────────────────────────────────────────────────────────┤
│                  State Management                          │
├─────────────────────────────────────────────────────────────┤
│  useAppStore (Zustand) - Audio & Practice State          │
│  usePlaylistStore (Zustand) - Playlist & File Management │
├─────────────────────────────────────────────────────────────┤
│                  Utility Layer                             │
├─────────────────────────────────────────────────────────────┤
│  subtitleParser, textComparison, transcriptFormatter      │
├─────────────────────────────────────────────────────────────┤
│                  Browser APIs                              │
├─────────────────────────────────────────────────────────────┤
│  HTML5 Audio API, MediaRecorder API, File API            │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── AudioPlayer.tsx     # Main audio control component
│   ├── ListeningMode.tsx   # Listening practice interface
│   ├── DictationMode.tsx   # Dictation practice interface
│   ├── ShadowingMode.tsx   # Shadowing practice interface
│   ├── FileUpload.tsx      # File upload handling
│   ├── Navigation.tsx      # App navigation
│   └── ...                 # Other UI components
├── pages/              # Route-level components
│   ├── HomePage.tsx        # Landing page
│   ├── AudioPlayerPage.tsx # Main practice page
│   ├── PlaylistPage.tsx    # Playlist management
│   └── UploadAudioPage.tsx # File upload page
├── store/              # State management
│   ├── useAppStore.ts      # Audio and practice state
│   └── usePlaylistStore.ts # Playlist and file state
├── utils/              # Utility functions
│   ├── subtitleParser.ts   # Subtitle file parsing
│   ├── textComparison.ts   # Text comparison logic
│   └── cn.ts              # CSS class utilities
├── types/              # TypeScript type definitions
│   └── index.ts           # Core type definitions
├── hooks/              # Custom React hooks
│   └── useGlobalKeyboardShortcuts.ts
└── App.tsx             # Main application component
```

## Technology Stack

### Frontend Framework
- **React 18**: Latest React with concurrent features and hooks
- **TypeScript 4.9.5**: Type-safe development with strict type checking
- **React Router DOM 7.8.0**: Client-side routing

### State Management
- **Zustand 5.0.6**: Lightweight state management with TypeScript support

### Styling & UI
- **Tailwind CSS 3.4.0**: Utility-first CSS framework
- **Lucide React 0.294.0**: Modern icon library
- **clsx & tailwind-merge**: CSS class utilities

### Audio & Media
- **React Player 3.3.1**: Audio playback component
- **HTML5 Audio API**: Native browser audio capabilities
- **MediaRecorder API**: Browser-based audio recording

### File Handling
- **React Dropzone 14.3.8**: Drag-and-drop file uploads

### Development Tools
- **React Scripts 5.0.1**: Create React App build tools
- **Web Vitals 3.5.0**: Performance monitoring
- **PostCSS & Autoprefixer**: CSS processing

## Core Features

### 1. Audio Management
- **Multi-format Support**: MP3, WAV, OGG, M4A
- **Advanced Controls**: Play/pause, seek, volume, playback speed
- **Real-time Synchronization**: Audio-subtitle timing alignment
- **Auto-replay**: Configurable loop functionality

### 2. Subtitle System
- **Format Support**: SRT and VTT subtitle files
- **Auto-detection**: Automatic subtitle file matching
- **Real-time Parsing**: Dynamic subtitle loading and parsing
- **Per-sentence Controls**: Individual speed and volume settings

### 3. Practice Modes
- **Listening Mode**: View all subtitles with current sentence highlighting
- **Dictation Mode**: Type what you hear with accuracy feedback
- **Shadowing Mode**: Record and compare pronunciation

### 4. File Management
- **Playlist System**: Organize audio files into playlists
- **Upload Interface**: Drag-and-drop file uploads
- **Batch Processing**: Multiple file upload support

## State Management

### useAppStore (Audio & Practice State)

The main application state manages audio playback, subtitle synchronization, and practice mode functionality.

#### Core State Properties

```typescript
interface AppState {
  // Audio state
  audioFile: File | null;
  audioUrl: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  volume: number;
  isReplayEnabled: boolean;
  
  // Subtitle state
  subtitleFile: File | null;
  subtitles: SubtitleEntry[];
  
  // Practice mode state
  practiceMode: PracticeMode;
  shadowingMode: ShadowingModeType;
  currentSentenceIndex: number;
}
```

#### Key Actions

```typescript
// Audio control
setAudioFile: (file: File | null) => void;
setIsPlaying: (playing: boolean) => void;
setCurrentTime: (time: number) => void;
setPlaybackSpeed: (speed: number) => void;

// Subtitle management
setSubtitles: (subtitles: SubtitleEntry[]) => void;
setSubtitleSpeed: (index: number, speed: number | undefined) => void;
setSubtitleVolume: (index: number, volume: number | undefined) => void;

// Practice mode
setPracticeMode: (mode: PracticeMode) => void;
setCurrentSentenceIndex: (index: number) => void;
```

#### Computed Values

```typescript
// Get current subtitle based on audio time
getCurrentSubtitle: () => SubtitleEntry | null;

// Get effective playback speed (global or per-sentence)
getCurrentPlaybackSpeed: () => number;

// Get effective volume (global or per-sentence)
getCurrentVolume: () => number;
```

### usePlaylistStore (Playlist & File Management)

Manages playlists, audio files, and file organization.

#### Core State Properties

```typescript
interface PlaylistState {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  audios: AudioFile[];
  currentAudio: AudioFile | null;
  isLoading: boolean;
  error: string | null;
}
```

#### Key Actions

```typescript
// Playlist management
createPlaylist: (playlist: PlaylistData) => void;
updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
deletePlaylist: (id: string) => void;

// Audio management
addAudio: (audio: AudioData) => void;
updateAudio: (id: string, updates: Partial<AudioFile>) => void;
deleteAudio: (id: string) => void;
```

## Component Architecture

### Core Components

#### AudioPlayer Component
The central audio control component providing playback controls and synchronization.

**Key Features:**
- HTML5 audio element with custom controls
- Real-time time tracking and seeking
- Playback speed and volume controls
- Auto-replay functionality
- Per-sentence speed/volume override support

**Props:**
```typescript
interface AudioPlayerProps {
  className?: string;
}
```

**Key Methods:**
- `handleTimeUpdate`: Updates current time from audio element
- `handleSeek`: Seeks to specific time position
- `handleSpeedChange`: Changes playback speed
- `handleVolumeChange`: Adjusts volume level

#### Practice Mode Components

##### ListeningMode Component
Displays all subtitles in a scrollable list with current sentence highlighting.

**Features:**
- Click-to-seek functionality
- Visual progress indicators
- Per-sentence speed and volume controls
- Auto-scroll to current sentence

##### DictationMode Component
Provides typing interface for dictation practice with real-time feedback.

**Features:**
- Text input with accuracy comparison
- Show/hide answer functionality
- Keyboard shortcuts (Tab for replay, Enter for next)
- Auto-stop when sentence ends

##### ShadowingMode Component
Enables audio recording and playback for pronunciation practice.

**Features:**
- Browser MediaRecorder API integration
- Sentence and full recording modes
- Recording playback and download
- Recording management (play, delete)

### Shared Components

#### CurrentSentence Component
Displays the current subtitle text with various display options.

**Props:**
```typescript
interface CurrentSentenceProps {
  showBlurred?: boolean;
  matchedWords?: string[];
  showAnswer?: boolean;
  showPlayingIndicator?: boolean;
}
```

#### VolumeControl Component
Provides per-sentence volume control with popup interface.

**Features:**
- Volume slider with visual feedback
- Default volume reset option
- Popup positioning and click-outside handling

## Practice Modes

### 1. Listening Mode

**Purpose**: Improve listening comprehension with visual subtitle support.

**Features:**
- **Full Subtitle Display**: View all subtitles in chronological order
- **Current Sentence Highlighting**: Visual indication of currently playing sentence
- **Click-to-Seek**: Jump to any sentence by clicking
- **Progress Indicators**: Visual feedback for completed sentences
- **Per-sentence Controls**: Individual speed and volume settings
- **Auto-scroll**: Automatically scrolls to current sentence

**Usage:**
1. Upload audio and subtitle files
2. Switch to Listening mode
3. Click play to start audio
4. Click any sentence to jump to that timestamp
5. Use per-sentence controls for fine-tuning

### 2. Dictation Mode

**Purpose**: Practice typing what you hear with accuracy feedback.

**Features:**
- **Sentence-by-Sentence Practice**: Focus on one sentence at a time
- **Real-time Feedback**: Visual indication of correct/incorrect words
- **Answer Reveal**: Show correct answer when needed
- **Auto-stop**: Audio stops when sentence ends
- **Keyboard Shortcuts**: Tab for replay, Enter for next sentence
- **Navigation**: Previous/Next sentence controls

**Workflow:**
1. Audio plays current sentence
2. User types what they hear
3. Real-time feedback shows accuracy
4. User must complete sentence correctly or show answer to proceed
5. Navigate to next/previous sentence

**Text Comparison Algorithm:**
```typescript
interface ComparisonResult {
  isCorrect: boolean;
  matchedWords: string[];
}
```

### 3. Shadowing Mode

**Purpose**: Practice pronunciation by recording and comparing with original audio.

**Features:**
- **Recording Modes**: Sentence-by-sentence or full audio recording
- **Audio Recording**: Browser MediaRecorder API integration
- **Recording Management**: Play, download, delete recordings
- **Mode Selection**: Toggle between sentence and full recording modes
- **Visual Feedback**: Recording status indicators

**Recording Modes:**
- **Sentence Mode**: Record individual sentences (auto-stops after each)
- **Full Mode**: Record entire audio file continuously

**Workflow:**
1. Select recording mode (sentence/full)
2. Click "Start Recording" to begin
3. Speak along with the audio
4. Click "Stop Recording" when finished
5. Play back recording to compare with original
6. Download or delete recording as needed

## Audio Processing

### HTML5 Audio Integration

The app uses the native HTML5 `<audio>` element with custom controls for optimal performance and compatibility.

**Key Audio Events:**
- `onTimeUpdate`: Updates current playback time
- `onLoadedMetadata`: Sets audio duration
- `onEnded`: Handles audio completion and replay

**Audio Synchronization:**
```typescript
// Real-time subtitle synchronization
const getCurrentSubtitleIndex = (): number => {
  return subtitles.findIndex(
    subtitle => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
  );
};
```

### Playback Speed Control

Supports both global and per-sentence playback speed control.

**Speed Options:** 0.25x, 0.5x, 0.75x, 1x

**Implementation:**
```typescript
// Global speed
audioRef.current.playbackRate = playbackSpeed;

// Per-sentence speed override
const effectiveSpeed = subtitle.speed ?? playbackSpeed;
audioRef.current.playbackRate = effectiveSpeed;
```

### Volume Control

Provides both global and per-sentence volume control.

**Volume Range:** 0.0 to 1.0 (0% to 100%)

**Implementation:**
```typescript
// Global volume
audioRef.current.volume = volume;

// Per-sentence volume override
const effectiveVolume = subtitle.volume ?? volume;
audioRef.current.volume = effectiveVolume;
```

## Subtitle System

### Supported Formats

#### SRT (SubRip) Format
```
1
00:00:01,000 --> 00:00:04,000
Hello, how are you today?

2
00:00:04,500 --> 00:00:07,500
I'm doing well, thank you for asking.
```

#### VTT (WebVTT) Format
```
WEBVTT

00:00:01.000 --> 00:00:04.000
Hello, how are you today?

00:00:04.500 --> 00:00:07.500
I'm doing well, thank you for asking.
```

### Parsing Implementation

#### SRT Parser
```typescript
export function parseSRT(srtContent: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const blocks = srtContent.trim().split('\n\n');
  
  blocks.forEach((block, index) => {
    const lines = block.split('\n');
    if (lines.length >= 3) {
      const timeLine = lines[1];
      const text = lines.slice(2).join('\n');
      
      const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
      if (timeMatch) {
        const startTime = parseTime(timeMatch[1]);
        const endTime = parseTime(timeMatch[2]);
        
        entries.push({
          id: index + 1,
          startTime,
          endTime,
          text: text.trim()
        });
      }
    }
  });
  
  return entries;
}
```

#### VTT Parser
```typescript
export function parseVTT(vttContent: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const lines = vttContent.split('\n');
  let currentEntry: Partial<SubtitleEntry> = {};
  let entryIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '' || line === 'WEBVTT') continue;
    
    const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
    if (timeMatch) {
      if (currentEntry.text) {
        entries.push(currentEntry as SubtitleEntry);
        entryIndex++;
      }
      
      currentEntry = {
        id: entryIndex + 1,
        startTime: parseTime(timeMatch[1]),
        endTime: parseTime(timeMatch[2]),
        text: ''
      };
    } else if (currentEntry.startTime !== undefined) {
      currentEntry.text = (currentEntry.text || '') + line + '\n';
    }
  }
  
  if (currentEntry.text) {
    entries.push(currentEntry as SubtitleEntry);
  }
  
  return entries;
}
```

### Auto-Detection System

The app automatically detects matching subtitle files based on filename patterns.

**Detection Logic:**
```typescript
export function findSubtitleFile(audioFileName: string, files: FileList): File | null {
  const baseName = audioFileName.replace(/\.[^/.]+$/, '').toLowerCase();
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = file.name.toLowerCase();
    const fileBaseName = fileName.replace(/\.[^/.]+$/, '');
    
    if ((fileName.endsWith('.srt') || fileName.endsWith('.vtt')) &&
        fileBaseName === baseName) {
      return file;
    }
  }
  
  return null;
}
```

## File Management

### Upload System

The app supports multiple file upload methods:

1. **Drag-and-Drop**: Using React Dropzone
2. **File Dialog**: Traditional file selection
3. **Folder Upload**: Batch processing of multiple files

### Supported File Types

#### Audio Formats
- **MP3**: Most common format, good compression
- **WAV**: Uncompressed, high quality
- **OGG**: Open source format
- **M4A**: Apple's audio format

#### Subtitle Formats
- **SRT**: SubRip format (most common)
- **VTT**: WebVTT format (web standard)

### Playlist System

#### Playlist Structure
```typescript
interface Playlist {
  id: string;
  name: string;
  description: string;
  visibility: PlaylistVisibility; // 'public' | 'protected' | 'private'
  ownerId: string;
  coverImage?: string;
  audioCount: number;
  createdAt: Date;
  updatedAt: Date;
  invitedUsers?: string[]; // For protected playlists
}
```

#### Audio File Structure
```typescript
interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  playlistId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Keyboard Shortcuts

### Global Shortcuts

The app implements global keyboard shortcuts for enhanced user experience.

**Implementation:**
```typescript
export const useGlobalKeyboardShortcuts = ({
  canProceedNext,
  onNext,
  onToggleRecording
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'Tab':
          event.preventDefault();
          // Replay current sentence
          break;
        case 'Enter':
          if (canProceedNext) {
            event.preventDefault();
            onNext();
          }
          break;
        case ' ':
          event.preventDefault();
          onToggleRecording?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canProceedNext, onNext, onToggleRecording]);
};
```

### Mode-Specific Shortcuts

#### Dictation Mode
- **Tab**: Replay current sentence
- **Enter**: Proceed to next sentence (when correct or answer shown)

#### Shadowing Mode
- **Space**: Toggle recording start/stop
- **Tab**: Replay current sentence
- **Enter**: Next sentence

#### Listening Mode
- **Click**: Seek to sentence timestamp
- **Arrow Keys**: Navigate between sentences

## Performance Optimizations

### React Optimizations

#### Component Memoization
```typescript
export const AudioPlayerComponent: React.FC<AudioPlayerProps> = memo(({ className }) => {
  // Component implementation
});
```

#### Callback Optimization
```typescript
const handleTimeUpdate = useCallback(() => {
  if (audioRef.current) {
    const newTime = audioRef.current.currentTime;
    setCurrentTime(newTime);
  }
}, [setCurrentTime]);
```

#### Effect Dependencies
Careful management of useEffect dependencies to prevent unnecessary re-renders.

### Audio Performance

#### Preloading Strategy
```typescript
<audio
  ref={audioRef}
  src={audioUrl}
  preload="metadata" // Load only metadata initially
  style={{ display: 'none' }}
/>
```

#### Efficient Time Updates
```typescript
// Throttled time updates to prevent excessive re-renders
useEffect(() => {
  if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 1) {
    audioRef.current.currentTime = currentTime;
  }
}, [currentTime]);
```

### State Management Optimization

#### Selective Updates
Zustand's built-in shallow comparison prevents unnecessary re-renders.

#### Computed Values
```typescript
// Computed values are calculated on-demand
getCurrentSubtitle: () => {
  const { subtitles, getCurrentSubtitleIndex } = get();
  const index = getCurrentSubtitleIndex();
  return index !== -1 ? subtitles[index] : null;
},
```

## Development Guide

### Setup Instructions

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd english-practice-simple
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

### Development Workflow

#### Adding New Features
1. Create feature branch
2. Implement changes in appropriate components
3. Update state management if needed
4. Add TypeScript types
5. Test across all practice modes
6. Submit pull request

#### Component Development
1. Use TypeScript for all components
2. Implement proper prop interfaces
3. Add memo() for performance
4. Use useCallback for event handlers
5. Follow existing naming conventions

#### State Management
1. Add new state to appropriate store
2. Implement actions and computed values
3. Update TypeScript interfaces
4. Test state changes across components

### Code Style Guidelines

#### TypeScript
- Use strict type checking
- Define interfaces for all props
- Use union types for enums
- Avoid `any` type

#### React
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance
- Follow React best practices

#### CSS/Styling
- Use Tailwind CSS utilities
- Follow mobile-first design
- Maintain consistent spacing
- Use semantic color classes

## API Reference

### Core Types

#### SubtitleEntry
```typescript
interface SubtitleEntry {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
  speed?: number; // Optional speed override
  volume?: number; // Optional volume override
}
```

#### AudioFile
```typescript
interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  playlistId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Playlist
```typescript
interface Playlist {
  id: string;
  name: string;
  description: string;
  visibility: PlaylistVisibility;
  ownerId: string;
  coverImage?: string;
  audioCount: number;
  createdAt: Date;
  updatedAt: Date;
  invitedUsers?: string[];
}
```

### Store Actions

#### useAppStore Actions
```typescript
// Audio control
setAudioFile: (file: File | null) => void;
setAudioUrl: (url: string) => void;
setIsPlaying: (playing: boolean) => void;
setCurrentTime: (time: number) => void;
setDuration: (duration: number) => void;
setPlaybackSpeed: (speed: number) => void;
setVolume: (volume: number) => void;

// Subtitle management
setSubtitleFile: (file: File | null) => void;
setSubtitles: (subtitles: SubtitleEntry[]) => void;
setSubtitleSpeed: (index: number, speed: number | undefined) => void;
setSubtitleVolume: (index: number, volume: number | undefined) => void;

// Practice mode
setPracticeMode: (mode: PracticeMode) => void;
setShadowingMode: (mode: ShadowingModeType) => void;
setCurrentSentenceIndex: (index: number) => void;
```

#### usePlaylistStore Actions
```typescript
// Playlist management
createPlaylist: (playlist: PlaylistData) => void;
updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
deletePlaylist: (id: string) => void;

// Audio management
addAudio: (audio: AudioData) => void;
updateAudio: (id: string, updates: Partial<AudioFile>) => void;
deleteAudio: (id: string) => void;
```

### Utility Functions

#### Subtitle Parsing
```typescript
parseSRT(srtContent: string): SubtitleEntry[]
parseVTT(vttContent: string): SubtitleEntry[]
findSubtitleFile(audioFileName: string, files: FileList): File | null
```

#### Text Comparison
```typescript
compareTexts(userInput: string, originalText: string): ComparisonResult
```

#### Time Formatting
```typescript
formatTime(time: number): string // Returns "MM:SS" format
```

## Troubleshooting

### Common Issues

#### Audio Playback Issues
**Problem**: Audio doesn't play or has errors
**Solutions**:
1. Check browser permissions for audio
2. Verify audio file format is supported
3. Ensure audio file is not corrupted
4. Check browser console for errors

#### Subtitle Synchronization Issues
**Problem**: Subtitles don't match audio timing
**Solutions**:
1. Verify subtitle file format (SRT/VTT)
2. Check subtitle timing accuracy
3. Ensure subtitle file matches audio file
4. Try re-uploading files

#### Recording Issues
**Problem**: Microphone recording doesn't work
**Solutions**:
1. Check browser microphone permissions
2. Ensure HTTPS connection (required for MediaRecorder)
3. Verify microphone is connected and working
4. Check browser console for errors

#### Performance Issues
**Problem**: App is slow or unresponsive
**Solutions**:
1. Check for large audio files
2. Verify browser memory usage
3. Close unnecessary browser tabs
4. Update browser to latest version

### Browser Compatibility

#### Supported Browsers
- **Chrome 90+**: Full support
- **Firefox 88+**: Full support
- **Safari 14+**: Full support
- **Edge 90+**: Full support

#### Feature Support Matrix
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Audio Playback | ✅ | ✅ | ✅ | ✅ |
| MediaRecorder | ✅ | ✅ | ✅ | ✅ |
| File Upload | ✅ | ✅ | ✅ | ✅ |
| Drag & Drop | ✅ | ✅ | ✅ | ✅ |

### Debug Mode

Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('debug', 'true');
```

### Error Reporting

The app includes error boundaries and console logging for debugging:
- Check browser console for detailed error messages
- Use React Developer Tools for component debugging
- Monitor network tab for file upload issues

---

## Conclusion

The English Practice App provides a comprehensive solution for English language learning through interactive audio practice. With its three distinct practice modes, advanced audio controls, and flexible file management system, it offers a powerful platform for improving listening, dictation, and shadowing skills.

The application's modern React architecture, TypeScript implementation, and performance optimizations ensure a smooth and responsive user experience across all supported browsers and devices.
