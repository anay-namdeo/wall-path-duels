import { useEffect, useState } from 'react';
import { Player } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Crown, Trophy, Sparkles, Coins, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WinnerCelebrationProps {
  winner: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onNewGame: () => void;
  coinsEarned: number;
  gameMode: '2-player' | '4-player';
}

export function WinnerCelebration({ 
  winner, 
  isOpen, 
  onClose, 
  onNewGame, 
  coinsEarned,
  gameMode 
}: WinnerCelebrationProps) {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isOpen && winner) {
      setShowFireworks(true);
      const timer = setTimeout(() => setShowFireworks(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, winner]);

  if (!winner) return null;

  const getPlayerColor = (player: Player) => {
    switch (player) {
      case 1: return "from-player-1 to-player-1-glow";
      case 2: return "from-player-2 to-player-2-glow";
      case 3: return "from-green-400 to-green-600";
      case 4: return "from-purple-400 to-purple-600";
      default: return "from-gray-400 to-gray-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 animate-pulse" />
        
        {/* Fireworks Effect */}
        {showFireworks && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              >
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
            ))}
          </div>
        )}

        <div className="relative z-10 space-y-6 py-8">
          {/* Winner Trophy */}
          <div className="flex justify-center">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center",
              "bg-gradient-to-br shadow-2xl animate-bounce",
              getPlayerColor(winner)
            )}>
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Winner Text */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              VICTORY!
            </h1>
            <p className="text-xl font-semibold">
              Player {winner} Wins!
            </p>
            <div className="flex items-center justify-center gap-2 text-lg">
              <Crown className="w-5 h-5 text-accent" />
              <span>Champion of ADION WAR</span>
              <Crown className="w-5 h-5 text-accent" />
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-card/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">Rewards Earned</h3>
            
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-500">
              <Coins className="w-6 h-6" />
              <span>+{coinsEarned} Coins</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Star className="w-5 h-5 mx-auto mb-1 text-accent" />
                <div className="font-semibold">Experience</div>
                <div className="text-muted-foreground">+{gameMode === '4-player' ? 150 : 100} XP</div>
              </div>
              
              <div className="text-center">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-accent" />
                <div className="font-semibold">Ranking</div>
                <div className="text-muted-foreground">+{gameMode === '4-player' ? 25 : 15} pts</div>
              </div>
              
              <div className="text-center">
                <Crown className="w-5 h-5 mx-auto mb-1 text-accent" />
                <div className="font-semibold">Streak</div>
                <div className="text-muted-foreground">Win +1</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onNewGame}
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Trophy className="w-4 h-4" />
              Play Again
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
            >
              Close
            </Button>
          </div>

          {/* Celebration Message */}
          <div className="text-sm text-muted-foreground">
            🎉 Congratulations on your victory in ADION WAR! 🎉
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}