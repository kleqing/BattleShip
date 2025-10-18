using BattleShip.WebApi.Models;
using BattleShip.WebApi.Requests;
using BattleShip.WebApi.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent; // Dùng cho thread-safe dictionary

namespace BattleShip.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameController : ControllerBase
    {
        private readonly GameService _gameService;
        private static readonly ConcurrentDictionary<string, GameState> _games = new();

        public GameController(GameService gameService)
        {
            _gameService = gameService;
        }

        [HttpPost("new")]
        public IActionResult NewGame()
        {
            var gameId = Guid.NewGuid().ToString();

            var newGameState = new GameState
            {
                PlayerBoard = _gameService.InitializeBoard(),
                AiBoard = _gameService.InitializeBoard(),
                IsGameStarted = false,
                IsPlayerTurn = true,
                GameOver = false,
                Winner = null
            };

            _games[gameId] = newGameState;

            return Ok(new { GameId = gameId, GameState = newGameState });
        }

        [HttpPost("place-ship")]
        public IActionResult PlaceShip([FromBody] PlaceShipRequest req)
        {
            if (!_games.TryGetValue(req.GameId, out var gameState))
            {
                return NotFound("Game not found.");
            }

            if (gameState.IsGameStarted)
            {
                return BadRequest("Game has already started.");
            }

            var updatedBoard = _gameService.PlaceShip(gameState.PlayerBoard, req.ShipId, req.ShipSize, req.X, req.Y,
                req.Orientation);
            gameState.PlayerBoard = updatedBoard;

            return Ok(gameState);
        }

        [HttpPost("start")]
        public IActionResult StartGame([FromBody] GameIdRequest req)
        {
            if (!_games.TryGetValue(req.GameId, out var gameState))
            {
                return NotFound("Game not found.");
            }

            gameState.AiBoard = _gameService.PlaceShipsRandomly(gameState.AiBoard, GameConstant.SHIPS);
            gameState.IsGameStarted = true;

            return Ok(gameState);
        }

        [HttpPost("shoot")]
        public IActionResult Shoot([FromBody] ShotRequest req)
        {
            if (!_games.TryGetValue(req.GameId, out var gameState))
            {
                return NotFound("Game not found.");
            }

            if (gameState.GameOver || !gameState.IsPlayerTurn)
            {
                return BadRequest("Not player's turn or game is over.");
            }

            var (updatedAiBoard, hit, _, _, _) = _gameService.ProcessShot(gameState.AiBoard, req.X, req.Y);
            gameState.AiBoard = updatedAiBoard;

            if (_gameService.AreAllShipsSunk(gameState.AiBoard))
            {
                gameState.GameOver = true;
                gameState.Winner = "player";
                return Ok(gameState);
            }

            gameState.IsPlayerTurn = false;

            var (updatedPlayerBoard, _) = _gameService.PerformAiShot(gameState.PlayerBoard);
            gameState.PlayerBoard = updatedPlayerBoard;

            if (_gameService.AreAllShipsSunk(gameState.PlayerBoard))
            {
                gameState.GameOver = true;
                gameState.Winner = "ai";
                return Ok(gameState);
            }

            gameState.IsPlayerTurn = true;

            return Ok(gameState);
        }
    }
}
