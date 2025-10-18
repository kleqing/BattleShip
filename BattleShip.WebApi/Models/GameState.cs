namespace BattleShip.WebApi.Models;

public class GameState
{
    public GameBoard PlayerBoard { get; set; } = new();
    public GameBoard AiBoard { get; set; } = new();
    public bool IsGameStarted { get; set; }
    public bool IsPlayerTurn { get; set; }
    public bool GameOver { get; set; }
    public string? Winner { get; set; } // "player", "ai", or null
    // public int? PlacingShipId { get; set; }
    // public int? PlacingShipSize { get; set; }
    // public Types.ShipOrientation PlacingShipOrientation { get; set; } = Types.ShipOrientation.Horizontal;
}