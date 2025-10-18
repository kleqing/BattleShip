import React, { useEffect, useState } from "react";
import "./App.css";
import GameBoard from "./components/GameBoard";
import ShipPlacement from "./components/ShipPlacement";
import GameStatus from "./components/GameStatus";
import GameModal from "./components/GameModal";
import ShipStatus from "./components/ShipStatus";
import DestroyedShipNotification from "./components/DestroyedShipNotification";
import { SHIPS, ShipOrientation, GameState, BOARD_SIZE, CellState } from "./models/types";
import { newGame, placeShipApi, startGameApi, shootApi } from "./api/game";

const App: React.FC = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [placingShipId, setPlacingShipId] = useState<number | null>(null);
  const [placingShipSize, setPlacingShipSize] = useState<number | null>(null);
  const [placingShipOrientation, setPlacingShipOrientation] = useState<ShipOrientation>(
    ShipOrientation.HORIZONTAL
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [destroyedShip, setDestroyedShip] = useState<{ name: string | null; isPlayerShip: boolean }>({
    name: null,
    isPlayerShip: false,
  });
  const [placedShips, setPlacedShips] = useState<number[]>([]);

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

  /** Handlers */
  const handlePlaceShip = async (x: number, y: number) => {
    if (!gameId || !placingShipId || !placingShipSize) return;

    const boardCells = gameState!.playerBoard.cells;

    // Kiểm tra trùng
    const isOverlap = (() => {
      for (let i = 0; i < placingShipSize; i++) {
        const xi = placingShipOrientation === ShipOrientation.HORIZONTAL ? x + i : x;
        const yi = placingShipOrientation === ShipOrientation.VERTICAL ? y + i : y;

        if (xi >= BOARD_SIZE || yi >= BOARD_SIZE) return true;

        if (boardCells[yi][xi].state === CellState.SHIP) return true;
      }
      return false;
    })();

    if (isOverlap) {
      alert("Cannot place ship here! It overlaps with another ship or is out of bounds.");
      return;
    }

    try {
      const updated = await placeShipApi(
        gameId,
        placingShipId,
        placingShipSize,
        x,
        y,
        placingShipOrientation
      );
      setGameState(updated);
      setPlacedShips((prev) => [...prev, placingShipId]);
      setPlacingShipId(null);
      setPlacingShipSize(null);
    } catch (err) {
      console.error("Place ship error:", err);
    }
  };

  const handleStartGame = async () => {
    if (!gameId) return;
    try {
      const updated = await startGameApi(gameId);
      setGameState(updated);
    } catch (err) {
      console.error("Start game error:", err);
    }
  };

  const handleShoot = async (x: number, y: number) => {
    if (!gameId) return;
    try {
      const updated = await shootApi(gameId, x, y);
      setGameState(updated);
      if (updated.gameOver) setModalOpen(true);
    } catch (err) {
      console.error("Shoot error:", err);
    }
  };

  const toggleOrientation = () => {
    setPlacingShipOrientation(prev =>
      prev === ShipOrientation.HORIZONTAL ? ShipOrientation.VERTICAL : ShipOrientation.HORIZONTAL
    );
  };

  if (!gameState) return <div>Loading game...</div>;

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

      {/* ShipPlacement trên cùng */}
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

      {/* Hai board nằm ngang */}
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
          />
          <ShipStatus ships={gameState.playerBoard.ships} isPlayerShips={true} />
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
          />
          <ShipStatus ships={gameState.aiBoard.ships} isPlayerShips={false} />
        </div>
      </div>

      {/* Controls */}
      <div className="game-controls">
        {!gameState.isGameStarted ? (
          <button onClick={handleStartGame}>Start Game</button>
        ) : (
          <button onClick={resetGame}>Reset</button>
        )}
      </div>

      <GameModal isOpen={modalOpen} winner={gameState.winner} onClose={resetGame} />
      <DestroyedShipNotification shipName={destroyedShip.name} isPlayerShip={destroyedShip.isPlayerShip} />
    </div>
  );
};

export default App;
