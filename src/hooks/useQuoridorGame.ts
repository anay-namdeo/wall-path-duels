import { useState, useCallback } from 'react';
import { GameState, Position, Wall, Player } from '@/types/game';

const BOARD_SIZE = 9;
const INITIAL_WALLS = 10;

const initialGameState: GameState = {
  currentPlayer: 1,
  player1Position: { row: 8, col: 4 }, // Bottom middle
  player2Position: { row: 0, col: 4 }, // Top middle
  walls: [],
  wallsRemaining: {
    player1: INITIAL_WALLS,
    player2: INITIAL_WALLS,
  },
  gameStatus: 'playing',
};

export function useQuoridorGame() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const isValidMove = useCallback((from: Position, to: Position, walls: Wall[]): boolean => {
    // Check if move is to adjacent cell
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      return !isWallBlocking(from, to, walls);
    }
    
    return false;
  }, []);

  const isWallBlocking = (from: Position, to: Position, walls: Wall[]): boolean => {
    // Check if any wall blocks the movement between two adjacent cells
    for (const wall of walls) {
      if (from.row === to.row) {
        // Horizontal movement
        const minCol = Math.min(from.col, to.col);
        const maxCol = Math.max(from.col, to.col);
        if (wall.orientation === 'vertical' && 
            wall.row === from.row && 
            wall.col >= minCol && wall.col < maxCol) {
          return true;
        }
      } else {
        // Vertical movement
        const minRow = Math.min(from.row, to.row);
        const maxRow = Math.max(from.row, to.row);
        if (wall.orientation === 'horizontal' && 
            wall.col === from.col && 
            wall.row >= minRow && wall.row < maxRow) {
          return true;
        }
      }
    }
    return false;
  };

  const canPlaceWall = useCallback((wall: Wall, walls: Wall[]): boolean => {
    // Check if wall placement is valid
    // 1. Wall must be within board bounds
    if (wall.orientation === 'horizontal') {
      if (wall.row >= BOARD_SIZE - 1 || wall.col >= BOARD_SIZE - 1) return false;
    } else {
      if (wall.row >= BOARD_SIZE - 1 || wall.col >= BOARD_SIZE - 1) return false;
    }

    // 2. Wall must not overlap with existing walls
    return !walls.some(existingWall => 
      existingWall.row === wall.row && 
      existingWall.col === wall.col && 
      existingWall.orientation === wall.orientation
    );
  }, []);

  const movePlayer = useCallback((position: Position) => {
    const currentPos = gameState.currentPlayer === 1 
      ? gameState.player1Position 
      : gameState.player2Position;

    if (!isValidMove(currentPos, position, gameState.walls)) {
      return false;
    }

    setGameState(prev => {
      const newState = { ...prev };
      
      if (prev.currentPlayer === 1) {
        newState.player1Position = position;
        // Check win condition - player 1 needs to reach row 0
        if (position.row === 0) {
          newState.gameStatus = 'player1Won';
          return newState;
        }
      } else {
        newState.player2Position = position;
        // Check win condition - player 2 needs to reach row 8
        if (position.row === 8) {
          newState.gameStatus = 'player2Won';
          return newState;
        }
      }

      newState.currentPlayer = prev.currentPlayer === 1 ? 2 : 1;
      return newState;
    });

    return true;
  }, [gameState, isValidMove]);

  const placeWall = useCallback((wall: Wall) => {
    if (!canPlaceWall(wall, gameState.walls)) {
      return false;
    }

    const currentPlayerWalls = gameState.currentPlayer === 1 
      ? gameState.wallsRemaining.player1 
      : gameState.wallsRemaining.player2;

    if (currentPlayerWalls <= 0) {
      return false;
    }

    setGameState(prev => ({
      ...prev,
      walls: [...prev.walls, wall],
      wallsRemaining: {
        ...prev.wallsRemaining,
        [prev.currentPlayer === 1 ? 'player1' : 'player2']: 
          prev.wallsRemaining[prev.currentPlayer === 1 ? 'player1' : 'player2'] - 1
      },
      currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
    }));

    return true;
  }, [gameState.walls, gameState.wallsRemaining, gameState.currentPlayer, canPlaceWall]);

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
  }, []);

  const getValidMoves = useCallback((playerPosition: Position): Position[] => {
    const validMoves: Position[] = [];
    const directions = [
      { row: -1, col: 0 }, // Up
      { row: 1, col: 0 },  // Down
      { row: 0, col: -1 }, // Left
      { row: 0, col: 1 },  // Right
    ];

    for (const dir of directions) {
      const newPos = {
        row: playerPosition.row + dir.row,
        col: playerPosition.col + dir.col,
      };

      if (newPos.row >= 0 && newPos.row < BOARD_SIZE && 
          newPos.col >= 0 && newPos.col < BOARD_SIZE &&
          isValidMove(playerPosition, newPos, gameState.walls)) {
        validMoves.push(newPos);
      }
    }

    return validMoves;
  }, [gameState.walls, isValidMove]);

  return {
    gameState,
    movePlayer,
    placeWall,
    resetGame,
    getValidMoves,
    isValidMove: (from: Position, to: Position) => isValidMove(from, to, gameState.walls),
    canPlaceWall: (wall: Wall) => canPlaceWall(wall, gameState.walls),
  };
}