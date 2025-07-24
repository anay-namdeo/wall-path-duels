import { useState, useCallback, useEffect } from 'react';
import { GameState, Position, Wall, Player, GameMove, BotDifficulty } from '@/types/game';
import { useAuth } from './useAuth';
import { useMultiplayer } from './useMultiplayer';

const BOARD_SIZE = 9;
const INITIAL_WALLS = 10;

const getInitialPosition = (player: Player, gameMode: '2-player' | '4-player'): Position => {
  if (gameMode === '2-player') {
    return player === 1 ? { row: 8, col: 4 } : { row: 0, col: 4 };
  } else {
    // 4-player positions
    switch (player) {
      case 1: return { row: 8, col: 4 }; // Bottom
      case 2: return { row: 0, col: 4 }; // Top
      case 3: return { row: 4, col: 0 }; // Left
      case 4: return { row: 4, col: 8 }; // Right
      default: return { row: 8, col: 4 };
    }
  }
};

const createInitialGameState = (gameMode: '2-player' | '4-player', isOnline: boolean = false): GameState => {
  const players = gameMode === '2-player' ? [1, 2] : [1, 2, 3, 4];
  const playersState: GameState['players'] = {};

  players.forEach(player => {
    playersState[player] = {
      position: getInitialPosition(player as Player, gameMode),
      wallsRemaining: INITIAL_WALLS,
      isActive: true,
      isBot: false,
      coins: 100,
      timeRemaining: 300 // 5 minutes
    };
  });

  return {
    currentPlayer: 1,
    players: playersState,
    walls: [],
    gameStatus: 'waiting',
    winner: null,
    gameMode,
    isOnline,
    spectators: [],
    chat: [],
    gameHistory: [],
    timeControl: {
      enabled: true,
      timePerTurn: 30,
      totalTime: 300
    }
  };
};

export function useQuoridorGame(gameMode: '2-player' | '4-player' = '2-player', isOnline: boolean = false) {
  const { gameUser, updateCoins } = useAuth();
  const { makeMove: makeOnlineMove } = useMultiplayer();
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(gameMode, isOnline));
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>({
    level: 'medium',
    thinkingTime: 1000,
    mistakeChance: 0.2
  });

  // Timer effect
  useEffect(() => {
    if (gameState.gameStatus !== 'playing' || !gameState.timeControl.enabled) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        const currentPlayerData = prev.players[prev.currentPlayer];
        if (currentPlayerData.timeRemaining <= 0) {
          // Time's up, switch player or end game
          return {
            ...prev,
            currentPlayer: getNextPlayer(prev.currentPlayer, prev.gameMode),
            gameStatus: 'finished',
            winner: getNextPlayer(prev.currentPlayer, prev.gameMode)
          };
        }

        return {
          ...prev,
          players: {
            ...prev.players,
            [prev.currentPlayer]: {
              ...currentPlayerData,
              timeRemaining: currentPlayerData.timeRemaining - 1
            }
          }
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.gameStatus, gameState.currentPlayer, gameState.timeControl.enabled]);

  const getNextPlayer = (currentPlayer: Player, gameMode: '2-player' | '4-player'): Player => {
    if (gameMode === '2-player') {
      return currentPlayer === 1 ? 2 : 1;
    } else {
      const activePlayers = Object.keys(gameState.players)
        .map(Number)
        .filter(p => gameState.players[p].isActive)
        .sort();
      
      const currentIndex = activePlayers.indexOf(currentPlayer);
      const nextIndex = (currentIndex + 1) % activePlayers.length;
      return activePlayers[nextIndex] as Player;
    }
  };

  const isValidMove = useCallback((from: Position, to: Position, walls: Wall[]): boolean => {
    // Check bounds
    if (to.row < 0 || to.row >= BOARD_SIZE || to.col < 0 || to.col >= BOARD_SIZE) {
      return false;
    }

    // Check if move is to adjacent cell
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      return !isWallBlocking(from, to, walls);
    }
    
    // Check for jumping over opponent
    if (rowDiff === 2 && colDiff === 0) {
      const middlePos = { row: (from.row + to.row) / 2, col: from.col };
      const isOpponentInMiddle = Object.values(gameState.players).some(
        player => player.position.row === middlePos.row && player.position.col === middlePos.col
      );
      return isOpponentInMiddle && !isWallBlocking(from, middlePos, walls) && !isWallBlocking(middlePos, to, walls);
    }
    
    if (rowDiff === 0 && colDiff === 2) {
      const middlePos = { row: from.row, col: (from.col + to.col) / 2 };
      const isOpponentInMiddle = Object.values(gameState.players).some(
        player => player.position.row === middlePos.row && player.position.col === middlePos.col
      );
      return isOpponentInMiddle && !isWallBlocking(from, middlePos, walls) && !isWallBlocking(middlePos, to, walls);
    }
    
    return false;
  }, [gameState.players]);

  const isWallBlocking = (from: Position, to: Position, walls: Wall[]): boolean => {
    for (const wall of walls) {
      if (from.row === to.row) {
        // Horizontal movement
        const minCol = Math.min(from.col, to.col);
        const maxCol = Math.max(from.col, to.col);
        if (wall.orientation === 'vertical' && 
            wall.row <= from.row && wall.row >= from.row - 1 &&
            wall.col >= minCol && wall.col < maxCol) {
          return true;
        }
      } else {
        // Vertical movement
        const minRow = Math.min(from.row, to.row);
        const maxRow = Math.max(from.row, to.row);
        if (wall.orientation === 'horizontal' && 
            wall.col <= from.col && wall.col >= from.col - 1 &&
            wall.row >= minRow && wall.row < maxRow) {
          return true;
        }
      }
    }
    return false;
  };

  const canPlaceWall = useCallback((wall: Wall, walls: Wall[]): boolean => {
    // Check bounds
    if (wall.orientation === 'horizontal') {
      if (wall.row >= BOARD_SIZE - 1 || wall.col >= BOARD_SIZE - 1) return false;
    } else {
      if (wall.row >= BOARD_SIZE - 1 || wall.col >= BOARD_SIZE - 1) return false;
    }

    // Check for overlapping walls
    const wouldOverlap = walls.some(existingWall => {
      if (existingWall.orientation !== wall.orientation) return false;
      
      if (wall.orientation === 'horizontal') {
        return existingWall.row === wall.row && 
               Math.abs(existingWall.col - wall.col) < 2;
      } else {
        return existingWall.col === wall.col && 
               Math.abs(existingWall.row - wall.row) < 2;
      }
    });

    if (wouldOverlap) return false;

    // Check if wall would block all paths (simplified check)
    // In a full implementation, you'd use pathfinding algorithms
    return true;
  }, []);

  const checkWinCondition = (player: Player, position: Position): boolean => {
    if (gameState.gameMode === '2-player') {
      return (player === 1 && position.row === 0) || (player === 2 && position.row === 8);
    } else {
      switch (player) {
        case 1: return position.row === 0;
        case 2: return position.row === 8;
        case 3: return position.col === 8;
        case 4: return position.col === 0;
        default: return false;
      }
    }
  };

  const makeMove = useCallback(async (position: Position) => {
    if (gameState.gameStatus !== 'playing') return false;

    const currentPlayerData = gameState.players[gameState.currentPlayer];
    if (!isValidMove(currentPlayerData.position, position, gameState.walls)) {
      return false;
    }

    const move: GameMove = {
      type: 'move',
      player: gameState.currentPlayer,
      position,
      timestamp: Date.now()
    };

    if (isOnline) {
      await makeOnlineMove(move);
    }

    setGameState(prev => {
      const newState = { ...prev };
      newState.players[prev.currentPlayer].position = position;
      newState.gameHistory.push(move);

      // Check win condition
      if (checkWinCondition(prev.currentPlayer, position)) {
        newState.gameStatus = 'finished';
        newState.winner = prev.currentPlayer;
        
        // Award coins to winner
        if (gameUser) {
          const coinReward = gameState.gameMode === '2-player' ? 50 : 100;
          updateCoins(coinReward);
        }
      } else {
        newState.currentPlayer = getNextPlayer(prev.currentPlayer, prev.gameMode);
        
        // Reset timer for next player
        if (newState.timeControl.enabled) {
          newState.players[newState.currentPlayer].timeRemaining = newState.timeControl.timePerTurn;
        }
      }

      return newState;
    });

    return true;
  }, [gameState, isValidMove, checkWinCondition, isOnline, makeOnlineMove, gameUser, updateCoins]);

  const placeWall = useCallback(async (wall: Wall) => {
    if (gameState.gameStatus !== 'playing') return false;

    const currentPlayerData = gameState.players[gameState.currentPlayer];
    if (currentPlayerData.wallsRemaining <= 0 || !canPlaceWall(wall, gameState.walls)) {
      return false;
    }

    const move: GameMove = {
      type: 'wall',
      player: gameState.currentPlayer,
      wall,
      timestamp: Date.now()
    };

    if (isOnline) {
      await makeOnlineMove(move);
    }

    setGameState(prev => ({
      ...prev,
      walls: [...prev.walls, wall],
      players: {
        ...prev.players,
        [prev.currentPlayer]: {
          ...prev.players[prev.currentPlayer],
          wallsRemaining: prev.players[prev.currentPlayer].wallsRemaining - 1
        }
      },
      gameHistory: [...prev.gameHistory, move],
      currentPlayer: getNextPlayer(prev.currentPlayer, prev.gameMode)
    }));

    return true;
  }, [gameState, canPlaceWall, isOnline, makeOnlineMove]);

  const undoLastMove = useCallback(() => {
    if (gameState.gameHistory.length === 0) return false;

    setGameState(prev => {
      const newHistory = [...prev.gameHistory];
      const lastMove = newHistory.pop();
      
      if (!lastMove) return prev;

      const newState = { ...prev, gameHistory: newHistory };

      if (lastMove.type === 'move' && lastMove.position) {
        // Undo move
        const previousMove = newHistory[newHistory.length - 1];
        if (previousMove && previousMove.type === 'move') {
          newState.players[lastMove.player].position = previousMove.position!;
        } else {
          newState.players[lastMove.player].position = getInitialPosition(lastMove.player, prev.gameMode);
        }
      } else if (lastMove.type === 'wall' && lastMove.wall) {
        // Undo wall placement
        newState.walls = prev.walls.filter(w => 
          !(w.row === lastMove.wall!.row && 
            w.col === lastMove.wall!.col && 
            w.orientation === lastMove.wall!.orientation)
        );
        newState.players[lastMove.player].wallsRemaining += 1;
      }

      return newState;
    });

    return true;
  }, [gameState.gameHistory]);

  const getValidMoves = useCallback((playerPosition: Position): Position[] => {
    const validMoves: Position[] = [];
    const directions = [
      { row: -1, col: 0 }, // Up
      { row: 1, col: 0 },  // Down
      { row: 0, col: -1 }, // Left
      { row: 0, col: 1 },  // Right
      { row: -2, col: 0 }, // Jump up
      { row: 2, col: 0 },  // Jump down
      { row: 0, col: -2 }, // Jump left
      { row: 0, col: 2 },  // Jump right
    ];

    for (const dir of directions) {
      const newPos = {
        row: playerPosition.row + dir.row,
        col: playerPosition.col + dir.col,
      };

      if (isValidMove(playerPosition, newPos, gameState.walls)) {
        validMoves.push(newPos);
      }
    }

    return validMoves;
  }, [gameState.walls, isValidMove]);

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState(gameMode, isOnline));
  }, [gameMode, isOnline]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing'
    }));
  }, []);

  const addBot = useCallback((difficulty: BotDifficulty) => {
    setBotDifficulty(difficulty);
    
    setGameState(prev => {
      const availableSlots = Object.keys(prev.players).map(Number).filter(p => !prev.players[p].isActive);
      if (availableSlots.length === 0) return prev;

      const botPlayer = availableSlots[0] as Player;
      return {
        ...prev,
        players: {
          ...prev.players,
          [botPlayer]: {
            ...prev.players[botPlayer],
            isActive: true,
            isBot: true
          }
        }
      };
    });
  }, []);

  // Bot AI logic
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;
    
    const currentPlayerData = gameState.players[gameState.currentPlayer];
    if (!currentPlayerData.isBot) return;

    const makeBotMove = async () => {
      await new Promise(resolve => setTimeout(resolve, botDifficulty.thinkingTime));

      // Simple AI: try to move towards goal, or place wall if beneficial
      const validMoves = getValidMoves(currentPlayerData.position);
      
      if (Math.random() > botDifficulty.mistakeChance && validMoves.length > 0) {
        // Choose best move towards goal
        let bestMove = validMoves[0];
        let bestScore = -1;

        for (const move of validMoves) {
          let score = 0;
          
          // Score based on distance to goal
          if (gameState.gameMode === '2-player') {
            if (gameState.currentPlayer === 1) {
              score = BOARD_SIZE - move.row;
            } else {
              score = move.row;
            }
          }
          
          if (score > bestScore) {
            bestScore = score;
            bestMove = move;
          }
        }

        await makeMove(bestMove);
      } else if (currentPlayerData.wallsRemaining > 0) {
        // Try to place a strategic wall
        const possibleWalls: Wall[] = [];
        
        for (let row = 0; row < BOARD_SIZE - 1; row++) {
          for (let col = 0; col < BOARD_SIZE - 1; col++) {
            const horizontalWall: Wall = { row, col, orientation: 'horizontal' };
            const verticalWall: Wall = { row, col, orientation: 'vertical' };
            
            if (canPlaceWall(horizontalWall, gameState.walls)) {
              possibleWalls.push(horizontalWall);
            }
            if (canPlaceWall(verticalWall, gameState.walls)) {
              possibleWalls.push(verticalWall);
            }
          }
        }

        if (possibleWalls.length > 0) {
          const randomWall = possibleWalls[Math.floor(Math.random() * possibleWalls.length)];
          await placeWall(randomWall);
        }
      }
    };

    makeBotMove();
  }, [gameState.currentPlayer, gameState.gameStatus, botDifficulty, getValidMoves, makeMove, placeWall, canPlaceWall]);

  return {
    gameState,
    movePlayer: makeMove,
    placeWall,
    resetGame,
    startGame,
    getValidMoves,
    undoLastMove,
    addBot,
    setBotDifficulty,
    isValidMove: (from: Position, to: Position) => isValidMove(from, to, gameState.walls),
    canPlaceWall: (wall: Wall) => canPlaceWall(wall, gameState.walls),
  };
}