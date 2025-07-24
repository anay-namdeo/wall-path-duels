import { Position, Wall, Player } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  player1Position: Position;
  player2Position: Position;
  walls: Wall[];
  currentPlayer: Player;
  validMoves: Position[];
  onCellClick: (position: Position) => void;
  onWallHover: (wall: Wall | null) => void;
  onWallClick: (wall: Wall) => void;
  previewWall: Wall | null;
}

export function GameBoard({
  player1Position,
  player2Position,
  walls,
  currentPlayer,
  validMoves,
  onCellClick,
  onWallHover,
  onWallClick,
  previewWall,
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
    const isPlayer1 = player1Position.row === row && player1Position.col === col;
    const isPlayer2 = player2Position.row === row && player2Position.col === col;
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
        disabled={!isValid && !isPlayer1 && !isPlayer2}
      >
        {/* Player 1 Pawn */}
        {isPlayer1 && (
          <div className={cn(
            "absolute inset-1 rounded-full",
            "bg-gradient-to-br from-player-1-glow to-player-1",
            "shadow-lg shadow-player-1/30",
            "border-2 border-player-1-glow/50",
            currentPlayer === 1 && "ring-2 ring-player-1-glow animate-pulse"
          )} />
        )}

        {/* Player 2 Pawn */}
        {isPlayer2 && (
          <div className={cn(
            "absolute inset-1 rounded-full",
            "bg-gradient-to-br from-player-2-glow to-player-2", 
            "shadow-lg shadow-player-2/30",
            "border-2 border-player-2-glow/50",
            currentPlayer === 2 && "ring-2 ring-player-2-glow animate-pulse"
          )} />
        )}

        {/* Valid Move Indicator */}
        {isValid && !isPlayer1 && !isPlayer2 && (
          <div className="absolute inset-3 rounded-full bg-primary/20 border-2 border-primary/40" />
        )}
      </button>
    );
  };

  const renderWallSlot = (row: number, col: number, orientation: 'horizontal' | 'vertical') => {
    const isPlaced = isWallPlaced(row, col, orientation);
    const isPreview = isWallPreview(row, col, orientation);
    
    if (orientation === 'horizontal') {
      return (
        <button
          key={`wall-h-${row}-${col}`}
          className={cn(
            "h-1 w-12 bg-transparent hover:bg-wall-hover/50",
            "transition-all duration-200",
            "focus:outline-none focus:bg-wall-hover/70",
            isPlaced && "bg-wall-color shadow-wall",
            isPreview && "bg-wall-preview"
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
            "w-1 h-12 bg-transparent hover:bg-wall-hover/50",
            "transition-all duration-200",
            "focus:outline-none focus:bg-wall-hover/70",
            isPlaced && "bg-wall-color shadow-wall",
            isPreview && "bg-wall-preview"
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
    <div className="relative p-6 bg-gradient-to-br from-board-bg to-board-bg/80 rounded-xl shadow-2xl">
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
                    className="w-1 h-1 bg-board-line rounded-full"
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