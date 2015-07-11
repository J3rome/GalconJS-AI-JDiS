// Set your team name here!!!
var name = "Bot";
var game;

var set_game = function (obj) {
  game = obj;
}

var update = function (game_objects) {
  console.log("update");
};

var set_name = function () {
  console.log("set_name");
  game.set_name(name);
};

module.exports = {
  set_name: set_name,
  update: update,
  set_game: set_game
};