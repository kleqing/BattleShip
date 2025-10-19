import React, { useEffect } from 'react';
import {
  BOARD_SIZE,
  Cell,
  CellState,
  GameBoard as GameBoardType,
  ShipOrientation,
} from '../models/types';
import './GameBoard.css';

interface GameBoardProps {
  board: GameBoardType;
  isPlayerBoard: boolean;
  isGameStarted: boolean;
  placingShipSize: number | null;
  placingShipOrientation: ShipOrientation;
  onCellClick: (x: number, y: number) => void;
  showShips: boolean;
  hoverCoords: { x: number; y: number } | null;
  setHoverCoords: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  isPlayerBoard,
  isGameStarted,
  placingShipSize,
  placingShipOrientation,
  onCellClick,
  showShips,
  hoverCoords,
  setHoverCoords,
}) => {
  // Force re-render khi orientation đổi
  useEffect(() => {
    if (hoverCoords) {
      setHoverCoords({ ...hoverCoords });
    }
  }, [placingShipOrientation]);

  const handleMouseEnter = (x: number, y: number) => {
    if (isPlayerBoard && !isGameStarted && placingShipSize) {
      setHoverCoords({ x, y });
    }
  };

  const handleMouseLeaveBoard = () => {
    setHoverCoords(null);
  };

  const getCellClassName = (cell: Cell, x: number, y: number) => {
    let className = 'cell';

    switch (cell.state) {
      case CellState.EMPTY:
        className += ' cell-empty';
        break;
      case CellState.SHIP:
        className += showShips ? ' cell-ship' : ' cell-empty';
        break;
      case CellState.HIT:
        className += ' cell-hit';
        break;
      case CellState.MISS:
        className += ' cell-miss';
        break;
    }

    if (isPlayerBoard && !isGameStarted && placingShipSize && hoverCoords) {
      for (let i = 0; i < placingShipSize; i++) {
        const xi =
          placingShipOrientation === ShipOrientation.HORIZONTAL
            ? hoverCoords.x + i
            : hoverCoords.x;
        const yi =
          placingShipOrientation === ShipOrientation.VERTICAL
            ? hoverCoords.y + i
            : hoverCoords.y;

        if (xi === x && yi === y) {
          const outOfBounds =
            xi < 0 || xi >= BOARD_SIZE || yi < 0 || yi >= BOARD_SIZE;
          className += outOfBounds ? ' cell-hover-invalid' : ' cell-hover';
        }
      }
    }

    return className;
  };

  const getHoverCells = () => {
    if (!isPlayerBoard || isGameStarted || !placingShipSize || !hoverCoords)
      return [];

    return Array.from({ length: placingShipSize }).map((_, i) => {
      const x =
        placingShipOrientation === ShipOrientation.HORIZONTAL
          ? hoverCoords.x + i
          : hoverCoords.x;
      const y =
        placingShipOrientation === ShipOrientation.VERTICAL
          ? hoverCoords.y + i
          : hoverCoords.y;

      const isOutOfBounds =
        x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE;
      const isOccupied =
        !isOutOfBounds && board.cells[y][x].state === CellState.SHIP;
      const valid = !isOutOfBounds && !isOccupied;

      return (
        <div
          key={`hover-${x}-${y}`}
          className={`hover-cell ${
            valid ? 'hover-cell-valid' : 'hover-cell-invalid'
          }`}
          style={{ left: `${x * 40 + 40}px`, top: `${y * 40 + 40}px` }}
        />
      );
    });
  };

  return (
    <div className="game-board">
      <div className="board-grid" onMouseLeave={handleMouseLeaveBoard}>
        {/* Column labels */}
        <div className="board-labels board-column-labels">
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <div key={`col-${i}`} className="board-label">
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>

        {/* Row labels + cells */}
        <div className="board-rows">
          {Array.from({ length: BOARD_SIZE }, (_, y) => (
            <div key={`row-${y}`} className="board-row">
              <div className="board-label">{y + 1}</div>
              {Array.from({ length: BOARD_SIZE }, (_, x) => (
                <div
                  key={`cell-${x}-${y}`}
                  className={getCellClassName(board.cells[y][x], x, y)}
                  onClick={() => onCellClick(x, y)}
                  onMouseEnter={() => handleMouseEnter(x, y)}
                />
              ))}
            </div>
          ))}
        </div>

        {hoverCoords && isPlayerBoard && (
          <div className="hover-ship">{getHoverCells()}</div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
