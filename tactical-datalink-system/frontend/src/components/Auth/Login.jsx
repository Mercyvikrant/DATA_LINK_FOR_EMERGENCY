import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success('Login successful!');
      if (result.user.role === 'command') {
        navigate('/command');
      } else {
        navigate('/node');
      }
    } else {
      setError(result.error);
      toast.error(result.error);
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a192f 30%, #172a45 90%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }}
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background:
            'radial-gradient(circle at center, #00f0ff22 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={10}
            sx={{
              p: 5,
              borderRadius: 4,
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              color: '#fff',
            }}
          >
            <Typography
              variant="h4"
              align="center"
              fontWeight="bold"
              gutterBottom
              sx={{
                background: 'linear-gradient(90deg, #00e5ff, #00ffb3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Tactical Data Link System
            </Typography>

            <Typography
              variant="h6"
              align="center"
              color="rgba(255,255,255,0.7)"
              gutterBottom
            >
              Secure Login
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{
                  style: { color: '#fff', borderColor: '#00e5ff', borderRadius:"50px",backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
                variant="outlined"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{
                  style: { color: '#fff', borderColor: '#00e5ff', borderRadius:"50px",backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
                variant="outlined"
              />

              <motion.div whileHover={{ scale: 1.03 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 4,
                    mb: 2,
                    py: 1.3,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    borderRadius: '50px',
                    transition: 'all 0.3s ease-in-out',
                    background: 'linear-gradient(90deg, #00e5ff, #00ffb3)',
                    color: '#000',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #00b8d4, #00c853)',
                    },
                  }}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </motion.div>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="#ccc">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    style={{
                      color: '#00e5ff',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    Register here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
