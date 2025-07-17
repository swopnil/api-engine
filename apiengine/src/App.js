import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import APIMakerEngine from './pages/ps';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <APIMakerEngine />
    </AuthProvider>
  );
}

export default App;
