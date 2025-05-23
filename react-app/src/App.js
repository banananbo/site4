import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Callback from './pages/Callback';
import Dashboard from './pages/Dashboard';
import WordManagement from './pages/WordManagement';
import ConversationPage from './pages/ConversationPage';
import ConversationDetail from './pages/ConversationDetail';
import IdiomsManagement from './pages/IdiomsManagement';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/callback" element={<Callback />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/words"
              element={
                <PrivateRoute>
                  <WordManagement />
                </PrivateRoute>
              }
            />
            <Route path="/conversation" element={<ConversationPage />} />
            <Route path="/conversations/:id" element={<ConversationDetail />} />
            <Route
              path="/idioms"
              element={
                <PrivateRoute>
                  <IdiomsManagement />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
