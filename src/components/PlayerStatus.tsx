import { Player } from '@/types/game';
import { cn } from '@/lib/utils';
import { Crown, Shield, Bot, Clock, Coins } from 'lucide-react';

interface PlayerStatusProps {
  currentPlayer: Player;
  players: {
    [key: number]: {
      position: { row: number; col: number };
      wallsRemaining: number;
      isActive: boolean;
      isBot: boolean;
      coins: number;
      timeRemaining: number;
    };
  };
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: Player | null;
  gameMode: '2-player' | '4-player';
  timeControl: { enabled: boolean; timePerTurn: number };
}

export function PlayerStatus({ 
  currentPlayer, 
  players, 
  gameStatus, 
  winner, 
  gameMode,
  timeControl 
}: PlayerStatusProps) {
  const renderPlayerCard = (player: Player) => {
    const playerData = players[player];
    if (!playerData?.isActive) return null;

    const isActive = currentPlayer === player && gameStatus === 'playing';
    const isWinner = winner === player;
    const playerColor = getPlayerColorClass(player);
    
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    return (
      <div 
        key={player}
        className={cn(
          "relative p-4 rounded-lg border-2 transition-all duration-300",
          "bg-card/50 backdrop-blur-sm",
          isActive && "border-primary shadow-lg shadow-primary/20 scale-105",
          !isActive && "border-border",
          isWinner && "border-accent shadow-lg shadow-accent/30 animate-pulse"
        )}
      >
        <div className="flex items-center gap-3">
          {/* Player Avatar */}
          <div className={cn(
            "w-12 h-12 rounded-full border-2 flex items-center justify-center",
            playerColor,
            isActive && "animate-pulse",
            isWinner && "ring-4 ring-accent animate-bounce"
          )}>
            {isWinner && <Crown className="w-6 h-6 text-card-foreground" />}
            {!isWinner && (
              <span className="text-card-foreground font-bold text-lg">{player}</span>
            )}
            {playerData.isBot && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                <Bot className="w-2 h-2 text-white" />
              </div>
            )}
          </div>

          {/* Player Info */}
          <div className="flex-1">
            <h3 className={cn(
              "font-semibold text-lg",
              isActive && "text-primary",
              isWinner && "text-accent"
            )}>
              Player {player} {playerData.isBot && "(Bot)"}
              {isWinner && " - Winner!"}
              {isActive && gameStatus === 'playing' && " - Your Turn"}
            </h3>
            
            {/* Player Stats */}
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {playerData.wallsRemaining} walls
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-500 font-medium">
                  {playerData.coins}
                </span>
              </div>
              
              {timeControl.enabled && (
                <div className="flex items-center gap-1">
                  <Clock className={cn(
                    "w-4 h-4",
                    playerData.timeRemaining < 10 ? "text-red-500" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-mono",
                    playerData.timeRemaining < 10 ? "text-red-500 animate-pulse" : "text-muted-foreground"
                  )}>
                    {formatTime(playerData.timeRemaining)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Player Indicator */}
        {isActive && gameStatus === 'playing' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
        )}
        
        {/* Winner Celebration */}
        {isWinner && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent rounded-lg animate-pulse" />
          </div>
        )}
      </div>
    );
  };

  const getPlayerColorClass = (player: Player) => {
    switch (player) {
      case 1: return "bg-gradient-to-br from-player-1-glow to-player-1 border-player-1-glow/50";
      case 2: return "bg-gradient-to-br from-player-2-glow to-player-2 border-player-2-glow/50";
      case 3: return "bg-gradient-to-br from-green-400 to-green-600 border-green-400/50";
      case 4: return "bg-gradient-to-br from-purple-400 to-purple-600 border-purple-400/50";
      default: return "bg-gradient-to-br from-gray-400 to-gray-600 border-gray-400/50";
    }
  };

  const activePlayers = Object.keys(players)
    .map(Number)
    .filter(p => players[p]?.isActive)
    .sort();

  return (
    <div className={cn(
      "space-y-4",
      gameMode === '4-player' && "grid grid-cols-2 gap-4 space-y-0"
    )}>
      {activePlayers.map(player => renderPlayerCard(player as Player))}
    </div>
  );
}