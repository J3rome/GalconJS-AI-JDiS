var name = "St0ners";
var game;

var helpers = require("./helpers");

var set_game = function (obj) {
  game = obj;
    helpers.init(name);
}

var update = function (game_objects) {
  console.log("update");
  helpers.parseGameObject(game_objects);
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