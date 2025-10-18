using BattleShip.WebApi.Models;
using BattleShip.WebApi.Requests;
using BattleShip.WebApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BattleShip.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameController : ControllerBase
{
    private readonly GameService _gameService;
    
    public GameController(GameService gameService)
    {
        _gameService = gameService;
    }
    
    [HttpPost("init")]
    public IActionResult Initialize()
    {
        var board = _gameService.InitializeBoard();
        board = _gameService.PlaceShipsRandomly(board, GameConstant.SHIPS);
        return Ok(board);
    }
    
    [HttpPost("shoot")]
    public IActionResult Shoot([FromBody] ShotRequest req)
    {
        var result = _gameService.ProcessShot(req.Board, req.X, req.Y);
        return Ok(new
        {
            hit = result.Hit,
            shipSunk = result.ShipSunk,
            shipName = result.ShipName,
            board = result.Board
        });
    }
}