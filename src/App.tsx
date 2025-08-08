import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { PlaylistPage } from './pages/PlaylistPage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import AudioPlayerPage from './pages/AudioPlayerPage';
import UploadAudioPage from './pages/UploadAudioPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';

const App = () => {
  const { initializeAuth, user, isLoading } = useAuthStore();
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navigation />}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/playlist" element={
            <ProtectedRoute>
              <PlaylistPage />
            </ProtectedRoute>
          } />
          <Route path="/playlist/:playlistId" element={
            <ProtectedRoute>
              <PlaylistDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/playlist/:playlistId/audio/:audioId" element={
            <ProtectedRoute>
              <AudioPlayerPage />
            </ProtectedRoute>
          } />
          <Route path="/upload-audio" element={
            <ProtectedRoute>
              <UploadAudioPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;