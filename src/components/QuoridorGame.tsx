import { useState } from 'react';
import { useQuoridorGame } from '@/hooks/useQuoridorGame';
import { GameBoard } from './GameBoard';
import { PlayerStatus } from './PlayerStatus';
import { GameControls } from './GameControls';
import { Position, Wall } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

export function QuoridorGame() {
  const {
    gameState,
    movePlayer,
    placeWall,
    resetGame,
    getValidMoves,
  } = useQuoridorGame();

  const [previewWall, setPreviewWall] = useState<Wall | null>(null);
  const { toast } = useToast();

  const currentPlayerPosition = gameState.currentPlayer === 1 
    ? gameState.player1Position 
    : gameState.player2Position;

  const validMoves = gameState.gameStatus === 'playing' 
    ? getValidMoves(currentPlayerPosition)
    : [];

  const handleCellClick = (position: Position) => {
    if (gameState.gameStatus !== 'playing') return;

    const success = movePlayer(position);
    if (!success) {
      toast({
        title: "Invalid Move",
        description: "You can only move to adjacent cells that aren't blocked by walls.",
        variant: "destructive"
      });
    }
  };

  const handleWallClick = (wall: Wall) => {
    if (gameState.gameStatus !== 'playing') return;

    const currentPlayerWalls = gameState.currentPlayer === 1 
      ? gameState.wallsRemaining.player1 
      : gameState.wallsRemaining.player2;

    if (currentPlayerWalls <= 0) {
      toast({
        title: "No Walls Remaining", 
        description: "You have used all your walls!",
        variant: "destructive"
      });
      return;
    }

    const success = placeWall(wall);
    if (!success) {
      toast({
        title: "Invalid Wall Placement",
        description: "Wall placement overlaps with an existing wall or is out of bounds.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Wall Placed",
        description: `Player ${gameState.currentPlayer} placed a ${wall.orientation} wall.`,
      });
    }
    setPreviewWall(null);
  };

  const handleWallHover = (wall: Wall | null) => {
    if (gameState.gameStatus !== 'playing') return;
    
    const currentPlayerWalls = gameState.currentPlayer === 1 
      ? gameState.wallsRemaining.player1 
      : gameState.wallsRemaining.player2;

    if (currentPlayerWalls > 0) {
      setPreviewWall(wall);
    }
  };

  const handleReset = () => {
    resetGame();
    setPreviewWall(null);
    toast({
      title: "Game Reset",
      description: "Starting a new game!",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Game Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-player-1 via-primary to-player-2 bg-clip-text text-transparent">
            Quoridor Duel
          </h1>
          <p className="text-lg text-muted-foreground">
            Strategy meets speed in this tactical board game
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_300px] gap-8 items-start">
          {/* Player Status - Left Side on Desktop */}
          <div className="order-2 lg:order-1">
            <PlayerStatus
              currentPlayer={gameState.currentPlayer}
              wallsRemaining={gameState.wallsRemaining}
              gameStatus={gameState.gameStatus}
            />
          </div>

          {/* Game Board - Center */}
          <div className="order-1 lg:order-2 flex justify-center">
            <GameBoard
              player1Position={gameState.player1Position}
              player2Position={gameState.player2Position}
              walls={gameState.walls}
              currentPlayer={gameState.currentPlayer}
              validMoves={validMoves}
              onCellClick={handleCellClick}
              onWallHover={handleWallHover}
              onWallClick={handleWallClick}
              previewWall={previewWall}
            />
          </div>

          {/* Game Controls - Right Side */}
          <div className="order-3">
            <GameControls
              onReset={handleReset}
              gameStatus={gameState.gameStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
}