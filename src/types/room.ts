export enum RoomEventType {
  ROOM_CREATED = 'roomCreated',
  ROOM_UPDATED = 'roomUpdate',
  USER_JOINED = 'userJoined',
  USER_LEFT = 'userLeft',
  VOTE_SUBMITTED = 'voteSubmitted',
  VOTES_TOGGLED = 'votesToggled',
  NEW_TASK_STARTED = 'newTaskStarted',
  ERROR = 'error'
}

export interface User {
  id: string;
  name: string;
  isScrumMaster: boolean;
  vote?: string;
}

export interface Room {
  id: string;
  teamName: string;
  users: User[];
  showVotes: boolean;
  currentTask?: string;
  lastActivity: Date;
}

export interface RoomError {
  message: string;
}

export interface CreateRoomData {
  roomId: string;
  userName: string;
  teamName: string;
  isScrumMaster: boolean;
}

export interface JoinRoomData {
  roomId: string;
  userName: string;
  isScrumMaster: boolean;
}

export interface VoteData {
  roomId: string;
  vote: string;
}

export interface NewTaskData {
  roomId: string;
  taskName: string;
}

export interface ToggleVotesData {
  roomId: string;
} 