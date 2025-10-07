import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CommandDashboard from './components/Command/CommandDashboard';
import NodeDashboard from './components/Node/NodeDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'command' ? '/command' : '/node'} />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route
                path="/command"
                element={
                  <ProtectedRoute allowedRole="command">
                    <CommandDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/node"
                element={
                  <ProtectedRoute allowedRole="node">
                    <NodeDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </Router>
          <ToastContainer position="top-right" autoClose={3000} />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;