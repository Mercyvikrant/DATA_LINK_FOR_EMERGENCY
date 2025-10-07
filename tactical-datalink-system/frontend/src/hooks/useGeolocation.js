import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export const useGeolocation = (autoUpdate = true, interval = 10000) => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { updatePosition } = useSocket();

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    const successHandler = (pos) => {
      const { latitude, longitude } = pos.coords;
      setPosition({ latitude, longitude });
      setError(null);
      setLoading(false);

      // Update position via socket
      if (autoUpdate) {
        updatePosition(latitude, longitude);
      }
    };

    const errorHandler = (err) => {
      setError(err.message);
      setLoading(false);
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler);

    // Set up interval for continuous updates
    let intervalId;
    if (autoUpdate) {
      intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
      }, interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoUpdate, interval, updatePosition]);

  return { position, error, loading };
};