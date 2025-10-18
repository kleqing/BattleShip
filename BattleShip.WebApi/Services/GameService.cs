using BattleShip.WebApi.Models;

namespace BattleShip.WebApi.Services;

public class GameService
{
    private static readonly Random _random = new();
    
    public GameBoard InitializeBoard()
    {
        var cells = new Cell[GameConstant.BOARD_SIZE][];

        for (int y = 0; y < GameConstant.BOARD_SIZE; y++)
        {
            cells[y] = new Cell[GameConstant.BOARD_SIZE];
            for (int x = 0; x < GameConstant.BOARD_SIZE; x++)
            {
                cells[y][x] = new Cell { X = x, Y = y, State = Types.CellState.Empty };
            }
        }

        return new GameBoard { Cells = cells, Ships = new List<Ship>() };
    }
    
    public bool CanPlaceShip(GameBoard board, int shipSize, int x, int y, Types.ShipOrientation orientation)
    {
        if (orientation == Types.ShipOrientation.Horizontal)
        {
            if (x + shipSize > GameConstant.BOARD_SIZE) return false;
        }
        else
        {
            if (y + shipSize > GameConstant.BOARD_SIZE) return false;
        }

        for (int i = 0; i < shipSize; i++)
        {
            int checkX = orientation == Types.ShipOrientation.Horizontal ? x + i : x;
            int checkY = orientation == Types.ShipOrientation.Horizontal ? y : y + i;

            if (board.Cells[checkY][checkX].State == Types.CellState.Ship)
                return false;

            for (int dx = -1; dx <= 1; dx++)
            {
                for (int dy = -1; dy <= 1; dy++)
                {
                    int adjX = checkX + dx;
                    int adjY = checkY + dy;

                    if (adjX >= 0 && adjX < GameConstant.BOARD_SIZE &&
                        adjY >= 0 && adjY < GameConstant.BOARD_SIZE &&
                        board.Cells[adjY][adjX].State == Types.CellState.Ship)
                    {
                        return false;
                    }
                }
            }
        }

        return true;
    }
    
    public GameBoard PlaceShip(GameBoard board, int shipId, int shipSize, int x, int y, Types.ShipOrientation orientation)
    {
        if (!CanPlaceShip(board, shipSize, x, y, orientation))
            return board;

        var positions = new List<(int X, int Y)>();

        for (int i = 0; i < shipSize; i++)
        {
            int shipX = orientation == Types.ShipOrientation.Horizontal ? x + i : x;
            int shipY = orientation == Types.ShipOrientation.Horizontal ? y : y + i;

            board.Cells[shipY][shipX].State = Types.CellState.Ship;
            board.Cells[shipY][shipX].ShipId = shipId;

            positions.Add((shipX, shipY));
        }

        var ship = new Ship
        {
            Id = shipId,
            Size = shipSize,
            Positions = positions,
            Hits = 0,
            IsSunk = false
        };

        board.Ships.Add(ship);
        return board;
    }
    
    public GameBoard PlaceShipsRandomly(GameBoard board, IEnumerable<ShipDefinition> ships)
    {
        foreach (var ship in ships)
        {
            bool placed = false;
            while (!placed)
            {
                var orientation = _random.Next(2) == 0 ? Types.ShipOrientation.Horizontal : Types.ShipOrientation.Vertical;
                int x = _random.Next(GameConstant.BOARD_SIZE);
                int y = _random.Next(GameConstant.BOARD_SIZE);

                if (CanPlaceShip(board, ship.Size, x, y, orientation))
                {
                    PlaceShip(board, ship.Id, ship.Size, x, y, orientation);
                    placed = true;
                }
            }
        }
        return board;
    }
    
    public (GameBoard Board, bool Hit, Ship? ShipSunk, string? ShipName) ProcessShot(GameBoard board, int x, int y)
    {
        var cell = board.Cells[y][x];

        if (cell.State == Types.CellState.Hit || cell.State == Types.CellState.Miss)
            return (board, false, null, null);

        bool hit = false;
        Ship? shipSunk = null;
        string? shipName = null;

        if (cell.State == Types.CellState.Ship)
        {
            hit = true;
            cell.State = Types.CellState.Hit;

            var ship = board.Ships.FirstOrDefault(s => s.Id == cell.ShipId);
            if (ship != null)
            {
                ship.Hits++;

                if (ship.Hits == ship.Size)
                {
                    ship.IsSunk = true;
                    shipSunk = ship;

                    var shipDef = GameConstant.SHIPS.FirstOrDefault(s => s.Id == ship.Id);
                    shipName = shipDef?.Name;
                }
            }
        }
        else
        {
            cell.State = Types.CellState.Miss;
        }

        return (board, hit, shipSunk, shipName);
    }

    public bool AreAllShipsSunk(GameBoard board)
    {
        return board.Ships.All(s => s.IsSunk);
    }
}