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
    origin: [
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'https://tactical-datalink.vercel.app',
      'https://*.vercel.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'https://tactical-datalink.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

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

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Register unit connection
  socket.on('register_unit', async (data) => {
    try {
      const { unitId } = data;
      
      const unit = await Unit.findOneAndUpdate(
        { unitId },
        { 
          isOnline: true,
          socketId: socket.id
        },
        { new: true }
      ).populate('userId', 'name email');

      if (unit) {
        socket.unitId = unitId;
        console.log(`✅ Unit ${unitId} registered with socket ${socket.id}`);
        
        // Broadcast unit came online to all clients
        io.emit('unit_online', {
          unitId: unit.unitId,
          unitType: unit.unitType,
          status: unit.status,
          position: unit.position,
          isOnline: true,
          resources: unit.resources,
          assignedEmergency: unit.assignedEmergency
        });
      } else {
        console.log(`❌ Unit ${unitId} not found in database`);
      }
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
      try {
        const unit = await Unit.findOneAndUpdate(
          { unitId: socket.unitId },
          { 
            isOnline: false,
            socketId: null
          },
          { new: true }
        );
        
        if (unit) {
          console.log(`Unit ${socket.unitId} went offline`);
          // Broadcast unit went offline
          io.emit('unit_offline', {
            unitId: unit.unitId
          });
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
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