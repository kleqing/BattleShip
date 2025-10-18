namespace BattleShip.WebApi.Models;

public static class GameConstant
{
    public const int BOARD_SIZE = 7;

    public static readonly ShipDefinition[] SHIPS =
    {
        new(1, 5, "Carrier"),
        new(2, 3, "Submarine"),
        new(3, 2, "Destroyer")
    };
}