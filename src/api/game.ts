import axios from "axios";
import { GameState, ShipOrientation } from "../models/types";

const API_BASE_URL = "https://localhost:7140/api/Game";


export async function newGame() {
  const res = await axios.post(`${API_BASE_URL}/new`);
  console.log("New game response:", res);
  return res.data as { gameId: string; gameState: GameState };
}

export async function placeShipApi(
  gameId: string,
  shipId: number,
  shipSize: number,
  x: number,
  y: number,
  orientation: ShipOrientation
) {
  const orientationValue = orientation === ShipOrientation.HORIZONTAL ? 0 : 1;

  const res = await axios.post(`${API_BASE_URL}/place-ship`, {
    gameId,
    shipId,
    shipSize,
    x,
    y,
    orientation: orientationValue,
  });

  return res.data as GameState;
}


export async function startGameApi(gameId: string) {
  const res = await axios.post(`${API_BASE_URL}/start`, { gameId });
  return res.data as GameState;
}

export async function shootApi(gameId: string, x: number, y: number) {
  const res = await axios.post(`${API_BASE_URL}/shoot`, { gameId, x, y });
  return res.data as GameState;
}
