namespace BattleShip.WebApi.Models;

public class Cell
{
    public int X { get; set; }
    public int Y { get; set; }
    public Types.CellState State { get; set; } = Types.CellState.Empty;
    public int? ShipId { get; set; }
}