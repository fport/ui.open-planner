import { useState, useEffect, useCallback } from 'react';
import { Room, CreateRoomData, JoinRoomData } from '@/types/room';
import { SocketService } from '@/services/socket';

export const useRoom = (roomId: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const socketService = SocketService.getInstance();

  useEffect(() => {
    let mounted = true;
    let cleanupFns: Array<() => void> = [];

    const connect = () => {
      try {
        setIsConnecting(true);
        const socket = socketService.connect();

        socket.on('connect', () => {
          if (mounted) {
            console.log('Connected with socket ID:', socket.id);
            setIsConnected(true);
            setIsConnecting(false);
            setError(null);
          }
        });

        socket.on('disconnect', () => {
          if (mounted) {
            console.log('Disconnected from server');
            setIsConnected(false);
            setError('Disconnected from server. Attempting to reconnect...');
          }
        });

        socket.on('connect_error', () => {
          if (mounted) {
            console.log('Connection error');
            setIsConnected(false);
            setError('Failed to connect to server. Retrying...');
          }
        });

        // Add cleanup functions for event handlers
        cleanupFns.push(
          socketService.onRoomCreated((updatedRoom: Room) => {
            if (mounted) {
              console.log('Room created:', updatedRoom);
              setRoom(updatedRoom);
              setError(null);
            }
          })
        );

        cleanupFns.push(
          socketService.onRoomUpdated((updatedRoom: Room) => {
            if (mounted) {
              console.log('Room updated:', updatedRoom);
              setRoom(updatedRoom);
              setError(null);
            }
          })
        );

        cleanupFns.push(
          socketService.onError((roomError) => {
            if (mounted) {
              console.error('Room error:', roomError);
              setError(roomError.message);
              if (roomError.message.includes('Room')) {
                setRoom(null);
              }
            }
          })
        );
      } catch (err) {
        if (mounted) {
          console.error('Socket initialization error:', err);
          setError('Failed to initialize socket connection');
          setIsConnecting(false);
        }
      }
    };

    connect();

    return () => {
      mounted = false;
      cleanupFns.forEach(cleanup => cleanup());
      socketService.disconnect();
    };
  }, []);

  const createRoom = useCallback((data: Omit<CreateRoomData, 'roomId'>) => {
    setError(null);
    if (!isConnected) {
      setError('Not connected to server');
      return;
    }
    console.log('Creating room:', { ...data, roomId });
    socketService.createRoom({ ...data, roomId });
  }, [roomId, isConnected]);

  const joinRoom = useCallback((data: Omit<JoinRoomData, 'roomId'>) => {
    setError(null);
    if (!isConnected) {
      setError('Not connected to server');
      return;
    }
    console.log('Joining room:', { ...data, roomId });
    socketService.joinRoom({ ...data, roomId });
  }, [roomId, isConnected]);

  const submitVote = useCallback((vote: string) => {
    setError(null);
    if (!isConnected) {
      setError('Not connected to server');
      return;
    }
    socketService.submitVote({ roomId, vote });
  }, [roomId, isConnected]);

  const startNewTask = useCallback((taskName: string) => {
    setError(null);
    if (!isConnected) {
      setError('Not connected to server');
      return;
    }
    socketService.startNewTask({ roomId, taskName });
  }, [roomId, isConnected]);

  const toggleVotes = useCallback(() => {
    setError(null);
    if (!isConnected) {
      setError('Not connected to server');
      return;
    }
    socketService.toggleVotes({ roomId });
  }, [roomId, isConnected]);

  const getCurrentUser = useCallback(() => {
    if (!room || !socketService.socketId) return null;
    return room.users.find(user => user.id === socketService.socketId) || null;
  }, [room]);

  return {
    room,
    error,
    isConnected,
    isConnecting,
    createRoom,
    joinRoom,
    submitVote,
    startNewTask,
    toggleVotes,
    getCurrentUser,
  };
}; 