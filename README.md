# Battleship

A browser-based implementation of the classic Battleship game, where you play against an AI opponent.

## Features

- Classic 7x7 Battleship grid
- Custom ship size (5, 3 and 2)
- Manual ship placement with horizontal/vertical orientation
- AI opponent with smart targeting logic
- Real-time game state updates without page reloads
- Victory/defeat modal when game ends

## Technologies ed

- React + TypeScript
- .NET (Reference [here](https://github.com/kleqing/BattleShip/tree/back-end))

## How to Play

1. Place your ships on your board by:
   - Selecting a ship from the list
   - Choosing horizontal or vertical orientation
   - Clicking on your board to place the ship

2. Once all ships are placed, click "Start Game"

3. Take turns with the AI:
   - Click on the enemy board to fire at a position
   - The AI will automatically take its turn after you

4. The game ends when all ships of one player are sunk

## Getting Started

### Prerequisites

- Node.js 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/kleqing/BattleShip
```

2. Navigate to the project directory
```bash
cd BattleShip
```

3. Install dependencies
```bash
npm i
```

4. Start the development server
```bash
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## Game Rules

- Each player has a fleet of 5 ships:
  - Carrier (5 cells)
  - Submarine (3 cells)
  - Destroyer (2 cells)

- Ships cannot overlap or be placed diagonally
- Ships cannot be moved once placed
- Players take turns firing at the opponent's grid
- A hit is marked in red, a miss in blue
- A ship is sunk when all its cells are hit
- The game ends when all ships of one player are sunk

## Screenshots

- Ship placement screen with click-to-place
  
![image](https://github.com/user-attachments/assets/e4cfd3e7-14f4-4754-b7e5-ec9c4cc39d19)

- Real-time feedback on hits and misses and "You sunk my Battleship!" messages.
  
![image](https://github.com/user-attachments/assets/1e10c215-62ae-4571-90f6-2459fe356ea5)

- End-of-game modal with reset option.
  
![image](https://github.com/user-attachments/assets/29f9f651-4dcc-40f5-8032-0f6b1941d2dc)

## License

This project is licensed under the  GPL-3.0 License - see the LICENSE file for details.
