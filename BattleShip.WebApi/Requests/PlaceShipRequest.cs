using BattleShip.WebApi.Models;

namespace BattleShip.WebApi.Requests;

public class PlaceShipRequest
{
    public string GameId { get; set; }
    public int ShipId { get; set; }
    public int ShipSize { get; set; }
    public int X { get; set; }
    public int Y { get; set; }
    public Types.ShipOrientation Orientation { get; set; }
}