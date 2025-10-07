import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [units, setUnits] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [messages, setMessages] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
        transports: ['websocket'],
        upgrade: false
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setConnected(true);

        // Register unit if node
        if (user.role === 'node' && user.unit) {
          newSocket.emit('register_unit', { unitId: user.unit.unitId });
        }

        // Request initial data
        if (user.role === 'command') {
          newSocket.emit('request_all_positions');
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      // Listen for position updates
      newSocket.on('position_updated', (data) => {
        setUnits((prevUnits) => {
          const index = prevUnits.findIndex(u => u.unitId === data.unitId);
          if (index !== -1) {
            const updated = [...prevUnits];
            updated[index] = { ...updated[index], ...data };
            return updated;
          }
          return [...prevUnits, data];
        });
      });

      // Listen for all positions (initial load)
      newSocket.on('all_positions', (data) => {
        setUnits(data);
      });

      // Listen for new emergencies
      newSocket.on('new_emergency', (emergency) => {
        setEmergencies((prev) => [emergency, ...prev]);
        if (user.role === 'command') {
          toast.warning(`New Emergency: ${emergency.title}`, {
            position: 'top-right',
            autoClose: 5000
          });
        }
      });

      // Listen for emergency assignments
      newSocket.on('emergency_assigned', (data) => {
        toast.info(`You've been assigned to: ${data.emergency.title}`, {
          position: 'top-right',
          autoClose: false
        });
      });

      // Listen for nearby resources
      newSocket.on('nearby_resources', (resources) => {
        console.log('Nearby resources:', resources);
        // This will be displayed in the node dashboard
      });

      // Listen for emergency status updates
      newSocket.on('emergency_status_updated', (data) => {
        setEmergencies((prev) => 
          prev.map(e => 
            e.emergencyId === data.emergencyId 
              ? { ...e, status: data.status } 
              : e
          )
        );
      });

      // Listen for unit assignments
      newSocket.on('unit_assigned', (data) => {
        toast.success(`Unit ${data.unitId} assigned to emergency`);
      });

      // Listen for new messages
      newSocket.on('new_message', (message) => {
        setMessages((prev) => [message, ...prev]);
        
        if (message.priority === 'urgent') {
          toast.error(`Urgent: ${message.content}`, {
            position: 'top-center',
            autoClose: false
          });
        }
      });

      // Listen for incoming calls
      newSocket.on('incoming_call', (data) => {
        toast.info(`Incoming call from ${data.from}`, {
          position: 'top-right',
          autoClose: 10000
        });
      });

      // Error handling
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(error.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  // Socket methods
  const updatePosition = (latitude, longitude) => {
    if (socket && user?.unit) {
      socket.emit('update_position', {
        unitId: user.unit.unitId,
        latitude,
        longitude
      });
    }
  };

  const reportEmergency = (emergencyData) => {
    if (socket) {
      socket.emit('report_emergency', emergencyData);
    }
  };

  const assignUnit = (emergencyId, unitId, role = 'primary') => {
    if (socket) {
      socket.emit('assign_unit', { emergencyId, unitId, role });
    }
  };

  const updateEmergencyStatus = (emergencyId, status, notes) => {
    if (socket) {
      socket.emit('update_emergency_status', { emergencyId, status, notes });
    }
  };

  const sendMessage = (content, to = null, priority = 'normal', messageType = 'text') => {
    if (socket && user) {
      socket.emit('send_message', {
        from: user.id,
        to,
        content,
        priority,
        messageType
      });
    }
  };

  const initiateCall = (to, callType = 'audio') => {
    if (socket && user) {
      socket.emit('initiate_call', {
        from: user.id,
        to,
        callType
      });
    }
  };

  const value = {
    socket,
    connected,
    units,
    emergencies,
    messages,
    updatePosition,
    reportEmergency,
    assignUnit,
    updateEmergencyStatus,
    sendMessage,
    initiateCall
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};