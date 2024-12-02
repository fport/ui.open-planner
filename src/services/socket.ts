import { io, Socket } from 'socket.io-client';
import {
  Room,
  RoomEventType,
  CreateRoomData,
  JoinRoomData,
  VoteData,
  NewTaskData,
  ToggleVotesData,
  RoomError
} from '@/types/room';

export class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventHandlers: Map<string, Function[]> = new Map();

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(url: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.close();
      this.socket.removeAllListeners();
    }

    console.log('Connecting to socket server:', url);
    
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: parseInt(process.env.NEXT_PUBLIC_SOCKET_TIMEOUT || '120000'),
      forceNew: false
    });

    this.setupDefaultHandlers();
    return this.socket;
  }

  private setupDefaultHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to socket server with ID:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from socket server:', reason);
      if (reason === 'io server disconnect') {
        setTimeout(() => this.socket?.connect(), 1000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  private addEventHandler(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);
  }

  public createRoom(data: CreateRoomData): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    console.log('Emitting createRoom event:', data);
    this.socket.emit('createRoom', data);
  }

  public joinRoom(data: JoinRoomData): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('joinRoom', data);
  }

  public submitVote(data: VoteData): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('vote', data);
  }

  public startNewTask(data: NewTaskData): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('startNewTask', data);
  }

  public toggleVotes(data: ToggleVotesData): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('toggleVotes', data);
  }

  public onRoomCreated(callback: (room: Room) => void): () => void {
    this.socket?.on(RoomEventType.ROOM_CREATED, callback);
    this.addEventHandler(RoomEventType.ROOM_CREATED, callback);
    return () => this.socket?.off(RoomEventType.ROOM_CREATED, callback);
  }

  public onRoomUpdated(callback: (room: Room) => void): () => void {
    this.socket?.on(RoomEventType.ROOM_UPDATED, callback);
    this.addEventHandler(RoomEventType.ROOM_UPDATED, callback);
    return () => this.socket?.off(RoomEventType.ROOM_UPDATED, callback);
  }

  public onNewTaskStarted(callback: (data: { taskName: string }) => void): () => void {
    this.socket?.on(RoomEventType.NEW_TASK_STARTED, callback);
    this.addEventHandler(RoomEventType.NEW_TASK_STARTED, callback);
    return () => this.socket?.off(RoomEventType.NEW_TASK_STARTED, callback);
  }

  public onError(callback: (error: RoomError) => void): () => void {
    this.socket?.on(RoomEventType.ERROR, callback);
    this.addEventHandler(RoomEventType.ERROR, callback);
    return () => this.socket?.off(RoomEventType.ERROR, callback);
  }

  public disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
      this.eventHandlers.clear();
    }
  }

  public removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.eventHandlers.clear();
      this.setupDefaultHandlers();
    }
  }

  public get socketId(): string | undefined {
    return this.socket?.id;
  }
} 