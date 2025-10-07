import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  Typography,
  Paper,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Send as SendIcon,
  Phone as PhoneIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';

const MessagePanel = () => {
  const { user } = useAuth();
  const { messages, sendMessage, initiateCall } = useSocket();
  const [messageText, setMessageText] = useState('');
  const [priority, setPriority] = useState('normal');
  const [allMessages, setAllMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load initial messages from API
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/messages`);
        setAllMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    // Update messages when new ones arrive via socket
    setAllMessages(prevMessages => {
      const messageIds = prevMessages.map(m => m._id);
      const newMessages = messages.filter(m => !messageIds.includes(m._id));
      return [...newMessages, ...prevMessages];
    });
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMessage(messageText, null, priority, 'text');
      setMessageText('');
      setPriority('normal');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      normal: 'default',
      high: 'warning',
      urgent: 'error'
    };
    return colors[priority] || 'default';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      p: 2 
    }}>
      <Typography variant="h6" gutterBottom>
        Communications
      </Typography>

      {/* Messages List */}
      <Paper 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto', 
          mb: 2,
          p: 2,
          backgroundColor: 'background.default'
        }}
      >
        <List>
          {allMessages.map((message, index) => {
            const isOwnMessage = message.from?._id === user?.id || message.from === user?.id;
            
            return (
              <ListItem
                key={message._id || index}
                sx={{
                  flexDirection: 'column',
                  alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    maxWidth: '80%',
                    backgroundColor: isOwnMessage ? 'primary.light' : 'grey.300',
                    borderRadius: 2,
                    p: 1.5,
                    position: 'relative'
                  }}
                >
                  {!isOwnMessage && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: isOwnMessage ? 'primary.contrastText' : 'text.primary'
                      }}
                    >
                      {message.from?.name || 'Unknown'}
                      {message.from?.role === 'command' && (
                        <Chip 
                          label="Command" 
                          size="small" 
                          sx={{ ml: 1, height: 16 }}
                        />
                      )}
                    </Typography>
                  )}
                  
                  <Typography 
                    variant="body2"
                    sx={{ 
                      color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                      wordBreak: 'break-word'
                    }}
                  >
                    {message.content}
                  </Typography>

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 0.5 
                  }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: isOwnMessage ? 'primary.contrastText' : 'text.secondary'
                      }}
                    >
                      {formatTime(message.createdAt)}
                    </Typography>
                    
                    {message.priority !== 'normal' && (
                      <Chip
                        label={message.priority}
                        color={getPriorityColor(message.priority)}
                        size="small"
                        icon={message.priority === 'urgent' ? <WarningIcon /> : undefined}
                        sx={{ height: 18, ml: 1 }}
                      />
                    )}
                  </Box>
                </Box>
              </ListItem>
            );
          })}
          <div ref={messagesEndRef} />
        </List>

        {allMessages.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No messages yet
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Message Input */}
      <Box>
        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            label="Priority"
          >
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <SendIcon />
          </Button>
        </Box>

        {user?.role === 'command' && (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PhoneIcon />}
            onClick={() => initiateCall('all', 'audio')}
            sx={{ mt: 1 }}
          >
            Broadcast Call
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default MessagePanel;