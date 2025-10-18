namespace BattleShip.WebApi.Models;

public static class GameConstant
{
    public const int BOARD_SIZE = 10;

    public static readonly ShipDefinition[] SHIPS =
    {
        new(1, 5, "Carrier"),
        new(2, 4, "Battleship"),
        new(3, 3, "Cruiser"),
        new(4, 3, "Submarine"),
        new(5, 2, "Destroyer")
    };
}