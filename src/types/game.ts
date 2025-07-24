export type Player = 1 | 2;

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
  player1Position: Position;
  player2Position: Position;
  walls: Wall[];
  wallsRemaining: {
    player1: number;
    player2: number;
  };
  gameStatus: 'playing' | 'player1Won' | 'player2Won';
}

export interface GameMove {
  type: 'move' | 'wall';
  position: Position;
  wall?: Wall;
}