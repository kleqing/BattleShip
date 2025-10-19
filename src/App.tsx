import React, { useEffect, useState } from "react";
import "./App.css";
import GameBoard from "./components/GameBoard";
import ShipPlacement from "./components/ShipPlacement";
import GameStatus from "./components/GameStatus";
import GameModal from "./components/GameModal";
import ShipStatus from "./components/ShipStatus";
import DestroyedShipNotification from "./components/DestroyedShipNotification";
import {
  SHIPS,
  ShipOrientation,
  GameState,
  BOARD_SIZE,
  CellState,
  Cell,
} from "./models/types";
import { newGame, placeShipApi, startGameApi, shootApi } from "./api/game";
import InfoModal from "./components/InfoModal";
import LoadingScreen from "./components/LoadingScreen";

const App: React.FC = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [placingShipId, setPlacingShipId] = useState<number | null>(null);
  const [placingShipSize, setPlacingShipSize] = useState<number | null>(null);
  const [placingShipOrientation, setPlacingShipOrientation] =
    useState<ShipOrientation>(ShipOrientation.HORIZONTAL);
  const [modalOpen, setModalOpen] = useState(false);
  const [placedShips, setPlacedShips] = useState<number[]>([]);
  const [hoverCoords, setHoverCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState("");
  const [isRandomizing, setIsRandomizing] = useState(false);

  /** Reset & start new game */
  const resetGame = async () => {
    try {
      const res = await newGame();
      setGameId(res.gameId);
      setGameState(res.gameState);
      setModalOpen(false);
      setPlacingShipId(null);
      setPlacingShipSize(null);
      setPlacingShipOrientation(ShipOrientation.HORIZONTAL);
      setPlacedShips([]);
    } catch (err) {
      console.error("Failed to start new game:", err);
    }
  };

  useEffect(() => {
    resetGame();
  }, []);

  const createEmptyBoard = (): { cells: Cell[][]; ships: any[] } => ({
    cells: Array.from({ length: BOARD_SIZE }, (_, y) =>
      Array.from({ length: BOARD_SIZE }, (_, x) => ({
        x,
        y,
        state: CellState.EMPTY,
      }))
    ),
    ships: [],
  });

  const handleRandomPlacement = async () => {
    if (!gameId) return;
    setIsRandomizing(true);

    try {
      const newBoard = createEmptyBoard();
      const placedIds: number[] = [];

      for (const ship of SHIPS) {
        let placed = false;

        while (!placed) {
          const orientation =
            Math.random() < 0.5
              ? ShipOrientation.HORIZONTAL
              : ShipOrientation.VERTICAL;

          const x = Math.floor(Math.random() * BOARD_SIZE);
          const y = Math.floor(Math.random() * BOARD_SIZE);

          const currentShipCells: { x: number; y: number }[] = [];
          for (let i = 0; i < ship.size; i++) {
            const xi = orientation === ShipOrientation.HORIZONTAL ? x + i : x;
            const yi = orientation === ShipOrientation.VERTICAL ? y + i : y;
            currentShipCells.push({ x: xi, y: yi });
          }

          let valid = true;

          for (const { x: xi, y: yi } of currentShipCells) {
            if (
              xi >= BOARD_SIZE ||
              yi >= BOARD_SIZE ||
              newBoard.cells[yi][xi].state === CellState.SHIP
            ) {
              valid = false;
              break;
            }

            for (let dx = -1; dx <= 1; dx++) {
              for (let dy = -1; dy <= 1; dy++) {
                const nx = xi + dx;
                const ny = yi + dy;

                if (
                  nx >= 0 &&
                  nx < BOARD_SIZE &&
                  ny >= 0 &&
                  ny < BOARD_SIZE &&
                  newBoard.cells[ny][nx].state === CellState.SHIP
                ) {
                  valid = false;
                  break;
                }
              }
              if (!valid) break;
            }
            if (!valid) break;
          }

          if (valid) {
            for (const { x: xi, y: yi } of currentShipCells) {
              newBoard.cells[yi][xi].state = CellState.SHIP;
            }

            await placeShipApi(gameId, ship.id, ship.size, x, y, orientation);
            placed = true;
            placedIds.push(ship.id);
          }
        }
      }

      setGameState((prev) =>
        prev ? { ...prev, playerBoard: newBoard } : prev
      );
      setPlacedShips(placedIds);
      setPlacingShipId(null);
      setPlacingShipSize(null);
      setHoverCoords(null);
    } 
    catch (err) {
      console.error("Random placement failed:", err);
    }
    finally {
      setIsRandomizing(false);
    }
  };

  const handleResetBoard = async () => {
    try {
      const res = await newGame();
      setGameId(res.gameId);
      setGameState(res.gameState);
      setPlacedShips([]);
      setPlacingShipId(null);
      setPlacingShipSize(null);
      setPlacingShipOrientation(ShipOrientation.HORIZONTAL);
      setHoverCoords(null);
    } catch (err) {
      console.error("Failed to reset board:", err);
    }
  };

  /** Place ship with optimistic update */
  const handlePlaceShip = async (x: number, y: number) => {
    if (!gameId || !placingShipId || !placingShipSize || !gameState) return;

    const cellsToPlace: { x: number; y: number }[] = [];
    for (let i = 0; i < placingShipSize; i++) {
      const xi =
        placingShipOrientation === ShipOrientation.HORIZONTAL ? x + i : x;
      const yi =
        placingShipOrientation === ShipOrientation.VERTICAL ? y + i : y;
      cellsToPlace.push({ x: xi, y: yi });
    }

    const isCellInvalid = (cx: number, cy: number) => {
      if (cx < 0 || cx >= BOARD_SIZE || cy < 0 || cy >= BOARD_SIZE) return true;
      if (gameState.playerBoard.cells[cy][cx].state === CellState.SHIP)
        return true;
      return false;
    };

    const hasAdjacentShip = (cx: number, cy: number) => {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;

          const nx = cx + dx;
          const ny = cy + dy;

          if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
            const isPartOfCurrentShip = cellsToPlace.some(
              (cell) => cell.x === nx && cell.y === ny
            );

            if (
              gameState.playerBoard.cells[ny][nx].state === CellState.SHIP &&
              !isPartOfCurrentShip
            ) {
              return true;
            }
          }
        }
      }
      return false;
    };

    for (const cell of cellsToPlace) {
      const { x: xi, y: yi } = cell;
      if (isCellInvalid(xi, yi) || hasAdjacentShip(xi, yi)) {
        setInfoModalMessage("Invalid ship placement! Ships cannot overlap or be adjacent.\nOnly random placement is allowed.");
        setInfoModalOpen(true);
        return;
      }
    }

    // Deep clone board
    const newBoard = {
      ...gameState.playerBoard,
      cells: gameState.playerBoard.cells.map((row) =>
        row.map((cell) => ({ ...cell }))
      ),
    };

    for (const { x: xi, y: yi } of cellsToPlace) {
      newBoard.cells[yi][xi].state = CellState.SHIP;
    }

    // Optimistic update
    setGameState((prev) => ({ ...prev!, playerBoard: newBoard }));

    try {
      const updated = await placeShipApi(
        gameId,
        placingShipId,
        placingShipSize,
        x,
        y,
        placingShipOrientation
      );
      setGameState((prev) =>
        prev ? { ...prev, playerBoard: updated.playerBoard } : prev
      );
      setPlacedShips((prev) => [...prev, placingShipId]);
      setPlacingShipId(null);
      setPlacingShipSize(null);
      setHoverCoords(null);
    } catch (err) {
      console.error("Place ship API error:", err);
    }
  };

  const handleStartGame = async () => {
    if (!gameId) return;
    try {
      const updated = await startGameApi(gameId);
      setGameState(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShoot = async (x: number, y: number) => {
    if (!gameId) return;
    try {
      const updated = await shootApi(gameId, x, y);
      setGameState(updated);
      if (updated.gameOver) setModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleOrientation = () =>
    setPlacingShipOrientation((prev) =>
      prev === ShipOrientation.HORIZONTAL
        ? ShipOrientation.VERTICAL
        : ShipOrientation.HORIZONTAL
    );

  if (!gameState) return <LoadingScreen />;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Battleship Game</h1>
      </header>

      <GameStatus
        isGameStarted={gameState.isGameStarted}
        isPlayerTurn={gameState.isPlayerTurn}
        gameOver={gameState.gameOver}
        winner={gameState.winner}
      />

      {!gameState.isGameStarted && (
        <ShipPlacement
          ships={SHIPS}
          placedShips={placedShips}
          placingShipId={placingShipId}
          placingShipSize={placingShipSize}
          placingShipOrientation={placingShipOrientation}
          onShipSelect={(id, size) => {
            setPlacingShipId(id);
            setPlacingShipSize(size);
          }}
          onOrientationToggle={toggleOrientation}
        />
      )}

      <div className="boards-container">
        <div className="board-wrapper">
          <h2>Your Fleet</h2>
          <GameBoard
            board={gameState.playerBoard}
            isPlayerBoard={true}
            isGameStarted={gameState.isGameStarted}
            placingShipSize={placingShipSize}
            placingShipOrientation={placingShipOrientation}
            onCellClick={handlePlaceShip}
            showShips={true}
            hoverCoords={hoverCoords}
            setHoverCoords={setHoverCoords}
          />
          <ShipStatus
            ships={gameState.playerBoard.ships}
            isPlayerShips={true}
          />
        </div>

        <div className="board-wrapper">
          <h2>Enemy Waters</h2>
          <GameBoard
            board={gameState.aiBoard}
            isPlayerBoard={false}
            isGameStarted={gameState.isGameStarted}
            placingShipSize={null}
            placingShipOrientation={ShipOrientation.HORIZONTAL}
            onCellClick={handleShoot}
            showShips={gameState.gameOver}
            hoverCoords={null}
            setHoverCoords={() => {}}
          />
          <ShipStatus ships={gameState.aiBoard.ships} isPlayerShips={false} />
        </div>
      </div>

      <div className="game-controls">
        {!gameState.isGameStarted ? (
          <div className="prestart-buttons">
            <button
              className="btn"
              onClick={handleStartGame}
              disabled={isRandomizing || placedShips.length < SHIPS.length}>
              {isRandomizing ? "Placing..." : "Start Game"}
            </button>
            <button className="btn btn-random" onClick={handleRandomPlacement} disabled={isRandomizing}>
              Random
            </button>
            <button className="btn btn-reset" onClick={handleResetBoard} disabled={isRandomizing}>
              Reset
            </button>
          </div>
        ) : (
          <button className="btn btn-reset" onClick={resetGame}>
            End Game
          </button>
        )}
      </div>

      <GameModal
        isOpen={modalOpen}
        winner={gameState.winner}
        onClose={resetGame}
      />

      <InfoModal
        isOpen={infoModalOpen}
        message={infoModalMessage}
        onClose={() => setInfoModalOpen(false)}
      />
      <DestroyedShipNotification shipName={null} isPlayerShip={false} />
    </div>
  );
};

export default App;
