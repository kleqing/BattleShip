using BattleShip.WebApi.Models;

namespace BattleShip.WebApi.Requests;

public class ShotRequest
{
    public GameBoard Board { get; set; } = default!;
    public int X { get; set; }
    public int Y { get; set; }
}