# English Practice App

A modern React TypeScript application for improving English listening, dictation, and shadowing skills. Built with the latest React 18, TypeScript, and Tailwind CSS for optimal performance.

## Features

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

## Technology Stack

- **React 18** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Web Vitals** - Performance monitoring
- **Modern ES6+** - Latest JavaScript features

## Performance Optimizations

- React.memo for component memoization
- useCallback for stable function references
- Lazy loading of components
- Optimized re-renders
- Efficient state management
- Modern CSS with Tailwind

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd english-practice
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
```

## Usage

1. **Upload Audio File**: Click "Select Audio File" to upload an MP3 or other audio format
2. **Upload Subtitle** (Optional): Upload a .srt or .vtt file with the same name as your audio file
3. **Choose Practice Mode**: Switch between Listening, Dictation, and Shadowing modes
4. **Practice**: Use the audio controls and practice interface to improve your skills

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
│   └── ShadowingMode.tsx
├── utils/              # Utility functions
│   ├── subtitleParser.ts
│   └── cn.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

### Key Features Implementation

- **Audio Synchronization**: Real-time audio and subtitle synchronization
- **File Processing**: Automatic subtitle detection and parsing
- **Recording API**: Browser MediaRecorder API for shadowing mode
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

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