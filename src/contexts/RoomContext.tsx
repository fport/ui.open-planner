import { createContext, useContext, ReactNode } from 'react';
import { Room, User } from '@/types/room';

interface RoomContextType {
  room: Room | null;
  error: string | null;
  isConnected: boolean;
  createRoom: (data: { userName: string; teamName: string; isScrumMaster: boolean }) => void;
  joinRoom: (data: { userName: string; isScrumMaster: boolean }) => void;
  submitVote: (vote: string) => void;
  startNewTask: (taskName: string) => void;
  toggleVotes: () => void;
  getCurrentUser: () => User | null;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const useRoomContext = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
};

interface RoomProviderProps {
  children: ReactNode;
  value: RoomContextType;
}

export const RoomProvider = ({ children, value }: RoomProviderProps) => {
  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>; 