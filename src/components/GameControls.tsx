import { Button } from '@/components/ui/button';
import { RotateCcw, Play, Gamepad2 } from 'lucide-react';

interface GameControlsProps {
  onReset: () => void;
  gameStatus: 'playing' | 'player1Won' | 'player2Won';
}

export function GameControls({ onReset, gameStatus }: GameControlsProps) {
  const isGameFinished = gameStatus !== 'playing';

  return (
    <div className="flex flex-col gap-4 p-6 bg-card/50 backdrop-blur-sm rounded-lg border">
      <div className="flex items-center gap-2 mb-2">
        <Gamepad2 className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Game Controls</h2>
      </div>

      <Button
        onClick={onReset}
        variant={isGameFinished ? "default" : "secondary"}
        className="w-full gap-2"
        size="lg"
      >
        {isGameFinished ? <Play className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
        {isGameFinished ? "New Game" : "Reset Game"}
      </Button>

      {/* Game Rules Summary */}
      <div className="text-sm text-muted-foreground space-y-2">
        <h3 className="font-semibold text-foreground">How to Play:</h3>
        <ul className="space-y-1 pl-4">
          <li>• Move your pawn one step closer to the opposite end</li>
          <li>• Use walls to block your opponent's path</li>
          <li>• First player to reach the opposite end wins!</li>
        </ul>
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs">
            <span className="font-semibold text-player-1">Player 1 (Blue)</span> moves from bottom to top<br/>
            <span className="font-semibold text-player-2">Player 2 (Orange)</span> moves from top to bottom
          </p>
        </div>
      </div>
    </div>
  );
}