import { Player } from '@/types/game';
import { cn } from '@/lib/utils';
import { Crown, Shield } from 'lucide-react';

interface PlayerStatusProps {
  currentPlayer: Player;
  wallsRemaining: {
    player1: number;
    player2: number;
  };
  gameStatus: 'playing' | 'player1Won' | 'player2Won';
}

export function PlayerStatus({ currentPlayer, wallsRemaining, gameStatus }: PlayerStatusProps) {
  const renderPlayerCard = (player: Player) => {
    const isActive = currentPlayer === player && gameStatus === 'playing';
    const isWinner = 
      (player === 1 && gameStatus === 'player1Won') ||
      (player === 2 && gameStatus === 'player2Won');
    const walls = player === 1 ? wallsRemaining.player1 : wallsRemaining.player2;
    const playerColor = player === 1 ? 'player-1' : 'player-2';
    
    return (
      <div className={cn(
        "relative p-4 rounded-lg border-2 transition-all duration-300",
        "bg-card/50 backdrop-blur-sm",
        isActive && "border-primary shadow-lg shadow-primary/20",
        !isActive && "border-border",
        isWinner && "border-accent shadow-lg shadow-accent/30"
      )}>
        <div className="flex items-center gap-3">
          {/* Player Avatar */}
          <div className={cn(
            "w-12 h-12 rounded-full border-2 flex items-center justify-center",
            `bg-gradient-to-br from-${playerColor}-glow to-${playerColor}`,
            `border-${playerColor}-glow/50`,
            isActive && "animate-pulse",
            isWinner && "ring-2 ring-accent"
          )}>
            {isWinner && <Crown className="w-6 h-6 text-card-foreground" />}
            {!isWinner && <span className="text-card-foreground font-bold">{player}</span>}
          </div>

          {/* Player Info */}
          <div className="flex-1">
            <h3 className={cn(
              "font-semibold text-lg",
              isActive && "text-primary",
              isWinner && "text-accent"
            )}>
              Player {player}
              {isWinner && " - Winner!"}
              {isActive && gameStatus === 'playing' && " - Your Turn"}
            </h3>
            
            {/* Walls Remaining */}
            <div className="flex items-center gap-2 mt-1">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {walls} walls remaining
              </span>
            </div>
          </div>
        </div>

        {/* Active Player Indicator */}
        {isActive && gameStatus === 'playing' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderPlayerCard(1)}
      {renderPlayerCard(2)}
    </div>
  );
}