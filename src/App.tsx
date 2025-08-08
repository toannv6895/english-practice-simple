import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { PlaylistPage } from './pages/PlaylistPage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import AudioPlayerPage from './pages/AudioPlayerPage';
import UploadAudioPage from './pages/UploadAudioPage';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/playlist" element={<PlaylistPage />} />
          <Route path="/playlist/:playlistId" element={<PlaylistDetailPage />} />
          <Route path="/playlist/:playlistId/audio/:audioId" element={<AudioPlayerPage />} />
          <Route path="/upload-audio" element={<UploadAudioPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;