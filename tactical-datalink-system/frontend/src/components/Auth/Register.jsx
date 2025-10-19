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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'node',
    unitId: '',
    unitType: 'rescue',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      unitId: formData.role === 'node' ? formData.unitId : undefined,
      unitType: formData.role === 'node' ? formData.unitType : undefined,
    });

    if (result.success) {
      toast.success('Registration successful!');
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
        overflow: 'hidden',
        position: 'relative',
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
              backdropFilter: 'blur(12px)',
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
              Create Your Account
            </Typography>

            <Typography
              variant="h6"
              align="center"
              color="rgba(255,255,255,0.7)"
              gutterBottom
            >
              Tactical Data Link System
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                required
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff' , borderRadius:"50px",backgroundColor: 'rgba(255, 255, 255, 0.1)'

                  
                } }}
              />

              <TextField
                fullWidth
                required
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff' , borderRadius:"50px",backgroundColor: 'rgba(255, 255, 255, 0.1)'} }}
              />

              <TextField
                fullWidth
                required
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff', borderRadius:"50px",backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              />

              <TextField
                fullWidth
                required
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff' , borderRadius:"50px",backgroundColor: 'rgba(255, 255, 255, 0.1)'} }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel sx={{ color: '#ccc' }}>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                  sx={{ color: '#fff', borderRadius:"50px",backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <MenuItem value="command">Command Center</MenuItem>
                  <MenuItem value="node">Field Unit (Node)</MenuItem>
                </Select>
              </FormControl>

              {formData.role === 'node' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <TextField
                    fullWidth
                    required
                    label="Unit ID"
                    name="unitId"
                    placeholder="e.g., AMBULANCE-01"
                    value={formData.unitId}
                    onChange={handleChange}
                    margin="normal"
                    InputLabelProps={{ style: { color: '#ccc' } }}
                    InputProps={{ style: { color: '#fff' , borderRadius:"50px",backgroundColor: 'rgba(255, 255, 255, 0.1)'} }}
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ color: '#ccc' }}>Unit Type</InputLabel>
                    <Select
                      name="unitType"
                      value={formData.unitType}
                      onChange={handleChange}
                      label="Unit Type"
                      sx={{ color: '#fff' , borderRadius:"50px",backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <MenuItem value="ambulance">Ambulance</MenuItem>
                      <MenuItem value="fire">Fire Truck</MenuItem>
                      <MenuItem value="police">Police</MenuItem>
                      <MenuItem value="rescue">Rescue</MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              )}

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
                    background: 'linear-gradient(90deg, #00e5ff, #00ffb3)',
                    color: '#000',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #00b8d4, #00c853)',
                      transform: 'scale(1.05)',
                    },
                  }}
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </motion.div>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="#ccc">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#00e5ff',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    Login here
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

export default Register;
