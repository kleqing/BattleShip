import React from 'react';
import { BOARD_SIZE, Cell, CellState, GameBoard as GameBoardType, ShipOrientation, SHIPS } from '../models/types';
import './GameBoard.css';
import { SHIP_ARTWORK_MAP, SHIP_FIRE_ARTWORK_MAP } from '../assets/shipArtwork';

interface GameBoardProps {
  board: GameBoardType;
  isPlayerBoard: boolean;
  isGameStarted: boolean;
  placingShipSize: number | null;
  placingShipOrientation: ShipOrientation;
  onCellClick: (x: number, y: number) => void;
  showShips: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  isPlayerBoard,
  isGameStarted,
  placingShipSize,
  placingShipOrientation,
  onCellClick,
  showShips,
}) => {
  const [hoverCoords, setHoverCoords] = React.useState<{ x: number; y: number } | null>(null);

  const handleMouseEnter = (x: number, y: number) => {
    if (isPlayerBoard && !isGameStarted && placingShipSize) {
      setHoverCoords({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setHoverCoords(null);
  };

  const getCellClassName = (cell: Cell, x: number, y: number) => {
    let className = 'cell';

    // Base cell state
    if (cell.state === CellState.EMPTY) {
      className += ' cell-empty';
    } else if (cell.state === CellState.SHIP) {
      className += showShips ? ' cell-ship' : ' cell-empty';
    } else if (cell.state === CellState.HIT) {
      className += ' cell-hit';
    } else if (cell.state === CellState.MISS) {
      className += ' cell-miss';
    }

    // Hover state for ship placement
    if (
      isPlayerBoard &&
      !isGameStarted &&
      placingShipSize &&
      hoverCoords &&
      x === hoverCoords.x &&
      y === hoverCoords.y
    ) {
      for (let i = 0; i < placingShipSize; i++) {
        const shipX = placingShipOrientation === ShipOrientation.HORIZONTAL ? x + i : x;
        const shipY = placingShipOrientation === ShipOrientation.VERTICAL ? y + i : y;

        if (shipX === x && shipY === y) {
          className += ' cell-hover';
        }
      }
    }

    return className;
  };

  const renderHoverShip = () => {
    if (!isPlayerBoard || isGameStarted || !placingShipSize || !hoverCoords) {
      return null;
    }

    const cells = [];
    for (let i = 0; i < placingShipSize; i++) {
      const x = placingShipOrientation === ShipOrientation.HORIZONTAL ? hoverCoords.x + i : hoverCoords.x;
      const y = placingShipOrientation === ShipOrientation.VERTICAL ? hoverCoords.y + i : hoverCoords.y;

      // Check if the ship would go out of bounds
      if (x >= BOARD_SIZE || y >= BOARD_SIZE) {
        continue;
      }

      // Check if the cell is already occupied
      const isOccupied = board.cells[y][x].state === CellState.SHIP;

      cells.push(
        <div
          key={`hover-${x}-${y}`}
          className={`hover-cell ${isOccupied ? 'hover-cell-invalid' : 'hover-cell-valid'} hover-x-${x} hover-y-${y}`}
        />
      );
    }

    return <div className="hover-ship">{cells}</div>;
  };

  const renderPlacedShipArtwork = () => {
    if (!isPlayerBoard || isGameStarted) {
      return null;
    }

    if (!board.ships.length) {
      return null;
    }

    return board.ships.map(ship => {
      const shipMeta = SHIPS.find(definition => definition.id === ship.id);
      const shipName = shipMeta?.name;
      const artwork = shipName ? SHIP_ARTWORK_MAP[shipName] : undefined;

      if (!artwork) {
        return null;
      }

      const minX = Math.min(...ship.positions.map(position => position.x));
      const minY = Math.min(...ship.positions.map(position => position.y));
      const isHorizontal = ship.orientation === ShipOrientation.HORIZONTAL;
      const widthInCells = isHorizontal ? ship.size : 1;
      const heightInCells = isHorizontal ? 1 : ship.size;

      const overlayKey = `placed-art-${ship.id}`;
      const orientationClass = isHorizontal ? 'horizontal' : 'vertical';
      const widthClass = `width-cells-${widthInCells}`;
      const heightClass = `height-cells-${heightInCells}`;
      const boardXClass = `board-x-${minX}`;
      const boardYClass = `board-y-${minY}`;

      return (
        <div
          key={overlayKey}
          className={`placed-ship-image-container ${orientationClass} ${boardXClass} ${boardYClass} ${widthClass} ${heightClass}`}
        >
          <img src={artwork} alt={`${shipName ?? 'Ship'} placed`} className="placed-ship-image" />
        </div>
      );
    });
  };

  const renderSunkShipArtwork = () => {
    const sunkShips = board.ships.filter(ship => ship.isSunk);
    if (sunkShips.length === 0) {
      return null;
    }

    return sunkShips.map(ship => {
      const shipMeta = SHIPS.find(definition => definition.id === ship.id);
      const shipName = shipMeta?.name;
      const artwork = shipName ? SHIP_FIRE_ARTWORK_MAP[shipName] : undefined;

      if (!artwork) {
        return null;
      }

      const minX = Math.min(...ship.positions.map(position => position.x));
      const minY = Math.min(...ship.positions.map(position => position.y));
      const isHorizontal = ship.orientation === ShipOrientation.HORIZONTAL;
      const widthInCells = isHorizontal ? ship.size : 1;
      const heightInCells = isHorizontal ? 1 : ship.size;

      const overlayKey = `sunk-art-${ship.id}`;
      const orientationClass = isHorizontal ? 'horizontal' : 'vertical';
      const widthClass = `width-cells-${widthInCells}`;
      const heightClass = `height-cells-${heightInCells}`;
      const boardXClass = `board-x-${minX}`;
      const boardYClass = `board-y-${minY}`;

      return (
        <div
          key={overlayKey}
          className={`sunk-ship-image-container ${orientationClass} ${boardXClass} ${boardYClass} ${widthClass} ${heightClass} ${isPlayerBoard ? 'player' : 'enemy'}`}
        >
          <img
            src={artwork}
            alt={`${shipName ?? 'Ship'} destroyed`}
            className="sunk-ship-image"
          />
        </div>
      );
    });
  };

  return (
    <div className="game-board">
      <div className="board-grid">
        {/* Column labels */}
        <div className="board-labels board-column-labels">
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <div key={`col-${i}`} className="board-label">
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>

        {/* Row labels and cells */}
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
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </div>
          ))}
        </div>

        {renderHoverShip()}
        <div className="placed-ship-overlay">{renderPlacedShipArtwork()}</div>
        <div className="sunk-ship-overlay">{renderSunkShipArtwork()}</div>
      </div>
    </div>
  );
};

export default GameBoard;
