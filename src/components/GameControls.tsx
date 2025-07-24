import { Button } from '@/components/ui/button';
import { RotateCcw, Play, Gamepad2, Undo, Lightbulb, Bot, Users, Timer, MessageCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BotDifficulty } from '@/types/game';

interface GameControlsProps {
  onReset: () => void;
  onUndo: () => void;
  onHint: () => void;
  onAddBot: (difficulty: BotDifficulty) => void;
  onToggleChat: () => void;
  onGameModeChange: (mode: '2-player' | '4-player') => void;
  onTimeControlToggle: (enabled: boolean) => void;
  gameStatus: 'waiting' | 'playing' | 'finished';
  gameMode: '2-player' | '4-player';
  timeControlEnabled: boolean;
  canUndo: boolean;
  isOnline: boolean;
}

export function GameControls({ 
  onReset, 
  onUndo,
  onHint,
  onAddBot,
  onToggleChat,
  onGameModeChange,
  onTimeControlToggle,
  gameStatus,
  gameMode,
  timeControlEnabled,
  canUndo,
  isOnline
}: GameControlsProps) {
  const isGameFinished = gameStatus === 'finished';
  const isGameWaiting = gameStatus === 'waiting';

  return (
    <div className="flex flex-col gap-6 p-6 bg-card/50 backdrop-blur-sm rounded-lg border">
      <div className="flex items-center gap-2 mb-2">
        <Gamepad2 className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Game Controls</h2>
      </div>

      {/* Primary Actions */}
      <div className="space-y-3">
        <Button
          onClick={onReset}
          variant={isGameFinished ? "default" : "secondary"}
          className="w-full gap-2"
          size="lg"
        >
          {isGameFinished ? <Play className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
          {isGameFinished ? "New Game" : "Reset Game"}
        </Button>

        {/* Game Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onUndo}
            variant="outline"
            size="sm"
            disabled={!canUndo || isGameFinished}
            className="gap-2"
          >
            <Undo className="w-4 h-4" />
            Undo
          </Button>
          
          <Button
            onClick={onHint}
            variant="outline"
            size="sm"
            disabled={isGameFinished}
            className="gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            Hint
          </Button>
        </div>
        
        <Button
          onClick={onToggleChat}
          variant="outline"
          className="w-full gap-2"
          size="sm"
        >
          <MessageCircle className="w-4 h-4" />
          Toggle Chat
        </Button>
      </div>

      {/* Game Settings */}
      {isGameWaiting && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-sm">Game Settings</h3>
          
          {/* Game Mode */}
          <div className="space-y-2">
            <Label className="text-sm">Game Mode</Label>
            <Select value={gameMode} onValueChange={onGameModeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2-player">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    2 Players
                  </div>
                </SelectItem>
                <SelectItem value="4-player">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    4 Players
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Control */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              <Label className="text-sm">Time Control</Label>
            </div>
            <Switch
              checked={timeControlEnabled}
              onCheckedChange={onTimeControlToggle}
            />
          </div>

          {/* Add Bot */}
          {!isOnline && (
            <div className="space-y-2">
              <Label className="text-sm">Add Bot</Label>
              <Select onValueChange={(value) => {
                const difficulty: BotDifficulty = {
                  level: value as any,
                  thinkingTime: value === 'easy' ? 500 : value === 'medium' ? 1000 : value === 'hard' ? 1500 : 2000,
                  mistakeChance: value === 'easy' ? 0.3 : value === 'medium' ? 0.2 : value === 'hard' ? 0.1 : 0.05
                };
                onAddBot(difficulty);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      Easy Bot
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      Medium Bot
                    </div>
                  </SelectItem>
                  <SelectItem value="hard">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      Hard Bot
                    </div>
                  </SelectItem>
                  <SelectItem value="expert">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      Expert Bot
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Game Rules Summary */}
      <div className="text-sm text-muted-foreground space-y-2 border-t pt-4">
        <h3 className="font-semibold text-foreground">How to Play:</h3>
        <ul className="space-y-1 pl-4">
          <li>• Move your pawn one step closer to the opposite end</li>
          <li>• Use walls to block your opponent's path</li>
          <li>• Jump over opponents when possible</li>
          <li>• First player to reach the opposite end wins!</li>
          {gameMode === '4-player' && <li>• In 4-player mode, reach your opposite corner</li>}
        </ul>
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs">
            <span className="font-semibold text-player-1">Player 1 (Blue)</span> moves from bottom to top<br/>
            <span className="font-semibold text-player-2">Player 2 (Orange)</span> moves from top to bottom
            {gameMode === '4-player' && (
              <>
                <br/><span className="font-semibold text-green-400">Player 3 (Green)</span> moves from left to right
                <br/><span className="font-semibold text-purple-400">Player 4 (Purple)</span> moves from right to left
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}