export type Player = 1 | 2 | 3 | 4;

export interface Position {
  row: number;
  col: number;
}

export interface Wall {
  row: number;
  col: number;
  orientation: 'horizontal' | 'vertical';
}

export interface GameState {
  currentPlayer: Player;
  players: {
    [key: number]: {
      position: Position;
      wallsRemaining: number;
      isActive: boolean;
      isBot: boolean;
      coins: number;
      timeRemaining: number;
    };
  };
  walls: Wall[];
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: Player | null;
  gameMode: '2-player' | '4-player';
  isOnline: boolean;
  roomId?: string;
  spectators: string[];
  chat: ChatMessage[];
  gameHistory: GameMove[];
  timeControl: {
    enabled: boolean;
    timePerTurn: number;
    totalTime: number;
  };
}

export interface GameMove {
  type: 'move' | 'wall';
  player: Player;
  position?: Position;
  wall?: Wall;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'system';
}

export interface User {
  id: string;
  username: string;
  email: string;
  coins: number;
  gamesPlayed: number;
  gamesWon: number;
  ranking: number;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  players: User[];
  spectators: User[];
  gameState: GameState;
  isPrivate: boolean;
  maxPlayers: number;
  createdAt: Date;
}

export interface BotDifficulty {
  level: 'easy' | 'medium' | 'hard' | 'expert';
  thinkingTime: number;
  mistakeChance: number;
}