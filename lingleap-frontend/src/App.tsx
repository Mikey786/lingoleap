// --- FILENAME: src/App.tsx ---
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Corrected Imports based on your file structure screenshot
import HomePage from './pages/Home/Home'; // Corrected: File is Home.tsx
import LoginPage from './pages/Login/Login'; // Corrected: File is Login.tsx
import RegisterPage from './pages/Register/Register'; // Corrected: File is Register.tsx
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './pages/DashboardLayout';
import ReadingTasksPage from './pages/ReadingTasks/ReadingTasksPage';
import ReadingTestPage from './pages/ReadingTest/ReadingTestPage';
import SpeakingTasksPage from './pages/SpeakingTasks/SpeakingTasksPage';
import SpeakingTestPage from './pages/SpeakingTest/SpeakingTest'; // Corrected: File is SpeakingTest.tsx
import AIChatPage from './pages/AIChat/AIChat'; // Corrected: File is AIChat.tsx, this will be the selection page
import ChatInterface from './pages/AIChat/ChatInterface'; // This is a new component for the actual chat window

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
                <Route path="/reading-tasks" element={<ReadingTasksPage />} />
                <Route path="/speaking-tasks" element={<SpeakingTasksPage />} />
                <Route path="/ai-chat" element={<AIChatPage />} />
            </Route>
            <Route path="/reading-test/:id" element={<ReadingTestPage />} />
            <Route path="/speaking-test/:id" element={<SpeakingTestPage />} />
            <Route path="/ai-chat/:character" element={<ChatInterface />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;