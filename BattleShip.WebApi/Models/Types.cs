namespace BattleShip.WebApi.Models;

public class Types
{
    public enum CellState
    {
        Empty,
        Ship,
        Hit,
        Miss
    }
    
    public enum ShipOrientation
    {
        Horizontal,
        Vertical
    }
}