namespace BattleShip.WebApi.Models;

public class GameBoard
{
    public Cell[][] Cells { get; set; } = new Cell[GameConstant.BOARD_SIZE][];
    public List<Ship> Ships { get; set; } = new();
}