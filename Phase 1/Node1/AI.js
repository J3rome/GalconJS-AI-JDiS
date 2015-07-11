var name = "St0ners";
var game;
var parsedGame;

var gameManager = require("./gameManager");

var set_game = function (obj) {
    game = obj;
    gameManager.init(game, name);
}

var update = function (game_objects) {
    parsedGame = gameManager.parseGameObject(game_objects);
    //gameManager.attackStrategy(parsedGame);
    gameManager.test(parsedGame);
};

var set_name = function () {
    console.log("Setting Name");
    game.set_name(name);
};

module.exports = {
    set_name: set_name,
    update: update,
    set_game: set_game
};