namespace BattleShip.WebApi.Models;

public class Ship
{
    public int Id { get; set; }
    public int Size { get; set; }
    public List<(int X, int Y)> Positions { get; set; } = new();
    public int Hits { get; set; }
    public bool IsSunk { get; set; }
}