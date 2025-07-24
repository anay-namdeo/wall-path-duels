import { useState } from 'react';
import { useQuoridorGame } from '@/hooks/useQuoridorGame';
import { useAuth } from '@/hooks/useAuth';
import { GameBoard } from './GameBoard';
import { PlayerStatus } from './PlayerStatus';
import { GameControls } from './GameControls';
import { ChatPanel } from './ChatPanel';
import { WinnerCelebration } from './WinnerCelebration';
import { AuthModal } from './AuthModal';
import { Position, Wall, BotDifficulty, ChatMessage } from '@/types/game';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User, Coins } from 'lucide-react';

export function QuoridorGame() {
  const { user, gameUser, signOut } = useAuth();
  const [gameMode, setGameMode] = useState<'2-player' | '4-player'>('2-player');
  const [isOnline, setIsOnline] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const {
    gameState,
    movePlayer: makeMove,
    placeWall,
    resetGame,
    startGame,
    getValidMoves,
    undoLastMove,
    addBot,
    setBotDifficulty,
  } = useQuoridorGame();

  const [previewWall, setPreviewWall] = useState<Wall | null>(null);
  const { toast } = useToast();

  const currentPlayerData = gameState.players[gameState.currentPlayer];
  const validMoves = gameState.gameStatus === 'playing' && currentPlayerData
    ? getValidMoves(currentPlayerData.position)
    : [];

  // Show winner celebration when game ends
  useState(() => {
    if (gameState.gameStatus === 'finished' && gameState.winner && !showWinnerModal) {
      setShowWinnerModal(true);
    }
  }, [gameState.gameStatus, gameState.winner]);

  const handleCellClick = (position: Position) => {
    if (gameState.gameStatus !== 'playing') return;

    const success = makeMove(position);
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

    const currentPlayerWalls = currentPlayerData?.wallsRemaining || 0;

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
        description: "Wall placement is invalid. Check for overlaps or blocked paths.",
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
    
    const currentPlayerWalls = currentPlayerData?.wallsRemaining || 0;

    if (currentPlayerWalls > 0) {
      setPreviewWall(wall);
    }
  };

  const handleReset = () => {
    resetGame();
    setPreviewWall(null);
    setShowWinnerModal(false);
    toast({
      title: "Game Reset",
      description: "Starting a new game!",
    });
  };

  const handleUndo = () => {
    const success = undoLastMove();
    if (success) {
      toast({
        title: "Move Undone",
        description: "Last move has been undone.",
      });
    } else {
      toast({
        title: "Cannot Undo",
        description: "No moves to undo.",
        variant: "destructive"
      });
    }
  };

  const handleHint = () => {
    if (!currentPlayerData) return;
    
    const moves = getValidMoves(currentPlayerData.position);
    if (moves.length > 0) {
      const bestMove = moves[0]; // Simple hint - first valid move
      toast({
        title: "Hint",
        description: `Try moving to row ${bestMove.row + 1}, column ${bestMove.col + 1}`,
      });
    } else {
      toast({
        title: "No Moves Available",
        description: "Consider placing a wall instead.",
      });
    }
  };

  const handleAddBot = (difficulty: BotDifficulty) => {
    addBot(difficulty);
    toast({
      title: "Bot Added",
      description: `Added ${difficulty.level} difficulty bot to the game.`,
    });
  };

  const handleSendMessage = (message: string) => {
    if (!gameUser) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      playerId: gameUser.id,
      playerName: gameUser.username,
      message,
      timestamp: Date.now(),
      type: 'chat'
    };
    
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleGameModeChange = (mode: '2-player' | '4-player') => {
    setGameMode(mode);
    resetGame();
  };

  const handleTimeControlToggle = (enabled: boolean) => {
    // This would update the game state time control
    toast({
      title: enabled ? "Time Control Enabled" : "Time Control Disabled",
      description: enabled ? "Players now have limited time per turn." : "Players have unlimited time.",
    });
  };

  const coinsEarned = gameMode === '4-player' ? 100 : 50;
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Game Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-player-1 via-primary to-player-2 bg-clip-text text-transparent">
              ADION WAR
            </h1>
            <p className="text-lg text-muted-foreground">
              The Ultimate Strategic Battle Arena
            </p>
          </div>
          
          {/* User Controls */}
          <div className="flex items-center gap-4">
            {user && gameUser ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-card/50 rounded-lg px-3 py-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{gameUser.username}</span>
                  <div className="flex items-center gap-1 ml-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-500 font-bold">{gameUser.coins}</span>
                  </div>
                </div>
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowAuthModal(true)}
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_300px] gap-8 items-start">
          {/* Player Status - Left Side on Desktop */}
          <div className="order-2 lg:order-1">
            <PlayerStatus
              currentPlayer={gameState.currentPlayer}
              players={gameState.players}
              gameStatus={gameState.gameStatus}
              winner={gameState.winner}
              gameMode={gameState.gameMode}
              timeControl={gameState.timeControl}
            />
          </div>

          {/* Game Board - Center */}
          <div className="order-1 lg:order-2 flex justify-center">
            <GameBoard
              players={gameState.players}
              walls={gameState.walls}
              currentPlayer={gameState.currentPlayer}
              validMoves={validMoves}
              onCellClick={handleCellClick}
              onWallHover={handleWallHover}
              onWallClick={handleWallClick}
              previewWall={previewWall}
              gameMode={gameState.gameMode}
              winner={gameState.winner}
            />
          </div>

          {/* Game Controls - Right Side */}
          <div className="order-3">
            <GameControls
              onReset={handleReset}
              onUndo={handleUndo}
              onHint={handleHint}
              onAddBot={handleAddBot}
              onToggleChat={() => setChatOpen(!chatOpen)}
              onGameModeChange={handleGameModeChange}
              onTimeControlToggle={handleTimeControlToggle}
              gameStatus={gameState.gameStatus}
              gameMode={gameState.gameMode}
              timeControlEnabled={gameState.timeControl.enabled}
              canUndo={gameState.gameHistory.length > 0}
              isOnline={gameState.isOnline}
            />
          </div>
        </div>
        
        {/* Start Game Button */}
        {gameState.gameStatus === 'waiting' && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={startGame}
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              Start Game
            </Button>
          </div>
        )}
      </div>
      
      {/* Chat Panel */}
      <ChatPanel
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        currentUserId={gameUser?.id}
      />
      
      {/* Winner Celebration Modal */}
      <WinnerCelebration
        winner={gameState.winner}
        isOpen={showWinnerModal}
        onClose={() => setShowWinnerModal(false)}
        onNewGame={handleReset}
        coinsEarned={coinsEarned}
        gameMode={gameState.gameMode}
      />
      
      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
}