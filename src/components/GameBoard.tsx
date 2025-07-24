import { Position, Wall, Player } from '@/types/game';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface GameBoardProps {
  players: { [key: number]: { position: Position; isActive: boolean; isBot: boolean } };
  walls: Wall[];
  currentPlayer: Player;
  validMoves: Position[];
  onCellClick: (position: Position) => void;
  onWallHover: (wall: Wall | null) => void;
  onWallClick: (wall: Wall) => void;
  previewWall: Wall | null;
  gameMode: '2-player' | '4-player';
  winner: Player | null;
}

export function GameBoard({
  players,
  walls,
  currentPlayer,
  validMoves,
  onCellClick,
  onWallHover,
  onWallClick,
  previewWall,
  gameMode,
  winner,
}: GameBoardProps) {
  const BOARD_SIZE = 9;

  const isValidMove = (row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const isWallPlaced = (row: number, col: number, orientation: 'horizontal' | 'vertical'): boolean => {
    return walls.some(wall => 
      wall.row === row && wall.col === col && wall.orientation === orientation
    );
  };

  const isWallPreview = (row: number, col: number, orientation: 'horizontal' | 'vertical'): boolean => {
    return previewWall?.row === row && 
           previewWall?.col === col && 
           previewWall?.orientation === orientation;
  };

  const renderCell = (row: number, col: number) => {
    const occupyingPlayer = Object.entries(players).find(
      ([_, player]) => player.position.row === row && player.position.col === col && player.isActive
    );
    const isValid = isValidMove(row, col);

    return (
      <button
        key={`cell-${row}-${col}`}
        className={cn(
          "relative w-12 h-12 border border-board-line bg-board-cell",
          "transition-all duration-200 hover:bg-board-cell-hover",
          isValid && "ring-2 ring-primary/50 ring-offset-1 ring-offset-background",
          "focus:outline-none focus:ring-2 focus:ring-primary"
        )}
        onClick={() => onCellClick({ row, col })}
        disabled={!isValid && !occupyingPlayer}
      >
        {/* Player Pawns */}
        {occupyingPlayer && (
          <div className="relative">
            <div className={cn(
              "absolute inset-1 rounded-full transition-all duration-300",
              getPlayerColors(Number(occupyingPlayer[0]) as Player),
              currentPlayer === Number(occupyingPlayer[0]) && "ring-2 animate-pulse",
              winner === Number(occupyingPlayer[0]) && "animate-bounce scale-110"
            )}>
              {/* Player number */}
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                {occupyingPlayer[0]}
              </div>
              {/* Bot indicator */}
              {occupyingPlayer[1].isBot && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full" />
                </div>
              )}
              {/* Winner celebration */}
              {winner === Number(occupyingPlayer[0]) && (
                <div className="absolute -inset-2 animate-spin">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Valid Move Indicator */}
        {isValid && !occupyingPlayer && (
          <div className="absolute inset-3 rounded-full bg-primary/20 border-2 border-primary/40" />
        )}
      </button>
    );
  };

  const getPlayerColors = (player: Player) => {
    switch (player) {
      case 1: return "bg-gradient-to-br from-player-1-glow to-player-1 shadow-lg shadow-player-1/30 border-2 border-player-1-glow/50 ring-player-1-glow";
      case 2: return "bg-gradient-to-br from-player-2-glow to-player-2 shadow-lg shadow-player-2/30 border-2 border-player-2-glow/50 ring-player-2-glow";
      case 3: return "bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-400/30 border-2 border-green-400/50 ring-green-400";
      case 4: return "bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-400/30 border-2 border-purple-400/50 ring-purple-400";
      default: return "bg-gradient-to-br from-gray-400 to-gray-600";
    }
  };

  const renderWallSlot = (row: number, col: number, orientation: 'horizontal' | 'vertical') => {
    const isPlaced = isWallPlaced(row, col, orientation);
    const isPreview = isWallPreview(row, col, orientation);
    
    if (orientation === 'horizontal') {
      return (
        <button
          key={`wall-h-${row}-${col}`}
          className={cn(
            "h-2 w-12 bg-transparent hover:bg-wall-hover/50 rounded-sm",
            "transition-all duration-200",
            "focus:outline-none focus:bg-wall-hover/70",
            isPlaced && "bg-wall-color shadow-wall border border-wall-color/50",
            isPreview && "bg-wall-preview border border-wall-preview/50"
          )}
          onMouseEnter={() => onWallHover({ row, col, orientation })}
          onMouseLeave={() => onWallHover(null)}
          onClick={() => onWallClick({ row, col, orientation })}
          disabled={isPlaced}
        />
      );
    } else {
      return (
        <button
          key={`wall-v-${row}-${col}`}
          className={cn(
            "w-2 h-12 bg-transparent hover:bg-wall-hover/50 rounded-sm",
            "transition-all duration-200",
            "focus:outline-none focus:bg-wall-hover/70",
            isPlaced && "bg-wall-color shadow-wall border border-wall-color/50",
            isPreview && "bg-wall-preview border border-wall-preview/50"
          )}
          onMouseEnter={() => onWallHover({ row, col, orientation })}
          onMouseLeave={() => onWallHover(null)}
          onClick={() => onWallClick({ row, col, orientation })}
          disabled={isPlaced}
        />
      );
    }
  };

  return (
    <div className={cn(
      "relative p-6 bg-gradient-to-br from-board-bg to-board-bg/80 rounded-xl shadow-2xl",
      winner && "ring-4 ring-accent/50 animate-pulse"
    )}>
      <div className="grid grid-cols-[repeat(17,_minmax(0,_1fr))] gap-0 w-fit mx-auto">
        {Array.from({ length: BOARD_SIZE * 2 - 1 }, (_, index) => {
          const isOddRow = index % 2 === 1;
          
          if (isOddRow) {
            // Wall row - render horizontal walls and intersections
            const wallRow = Math.floor(index / 2);
            return Array.from({ length: BOARD_SIZE * 2 - 1 }, (_, colIndex) => {
              const isOddCol = colIndex % 2 === 1;
              
              if (isOddCol) {
                // Intersection - render a small dot
                return (
                  <div
                    key={`intersection-${wallRow}-${Math.floor(colIndex / 2)}`}
                    className="w-2 h-2 bg-board-line rounded-full"
                  />
                );
              } else {
                // Horizontal wall slot
                const wallCol = Math.floor(colIndex / 2);
                return renderWallSlot(wallRow, wallCol, 'horizontal');
              }
            });
          } else {
            // Cell row - render cells and vertical walls
            const cellRow = Math.floor(index / 2);
            return Array.from({ length: BOARD_SIZE * 2 - 1 }, (_, colIndex) => {
              const isOddCol = colIndex % 2 === 1;
              
              if (isOddCol) {
                // Vertical wall slot
                const wallCol = Math.floor(colIndex / 2);
                return renderWallSlot(cellRow, wallCol, 'vertical');
              } else {
                // Game cell
                const cellCol = Math.floor(colIndex / 2);
                return renderCell(cellRow, cellCol);
              }
            });
          }
        })}
      </div>
    </div>
  );
}