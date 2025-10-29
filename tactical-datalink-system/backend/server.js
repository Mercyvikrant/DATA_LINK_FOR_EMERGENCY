const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'your-production-url' 
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const unitRoutes = require('./routes/units');
const emergencyRoutes = require('./routes/emergencies');
const messageRoutes = require('./routes/messages');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/messages', messageRoutes);

// Socket.IO connection handling
const positionHandler = require('./socketHandlers/positionHandler');
const emergencyHandler = require('./socketHandlers/emergencyHandler');
const communicationHandler = require('./socketHandlers/communicationHandler');

const Unit = require('./models/Unit');
// After creating io instance, add this line
app.set('io', io);

// The rest of server.js remains the same
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Register unit connection
  socket.on('register_unit', async (data) => {
    try {
      const { unitId } = data;
      
      await Unit.findOneAndUpdate(
        { unitId },
        { 
          isOnline: true,
          socketId: socket.id
        }
      );

      socket.unitId = unitId;
      console.log(`Unit ${unitId} registered with socket ${socket.id}`);
    } catch (error) {
      console.error('Unit registration error:', error);
    }
  });

  // Initialize socket handlers
  positionHandler(io, socket);
  emergencyHandler(io, socket);
  communicationHandler(io, socket);

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    
    if (socket.unitId) {
      await Unit.findOneAndUpdate(
        { unitId: socket.unitId },
        { 
          isOnline: false,
          socketId: null
        }
      );
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server ready`);
});

