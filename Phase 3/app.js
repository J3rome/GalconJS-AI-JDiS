var net = require('net');
var AI = require('./AI.js');
var port = 8890;
var args = process.argv.slice(2);
if (args.length > 0) {
  port = parseInt(args[0]);
}
var client;

net.createServer(function (socket) {
  socket.name = socket.remoteAddress + ":" + socket.remotePort;
  console.log("Connected to: " + socket.name);
  client = socket;
  client.on('data', function (data) {
    var buffer = [];
    buffer.push(data);
    var content = buffer.join("").slice(4);
    var json = JSON.parse(content);
    if (json.type != "client_end")
      AI[json.type](json.data);
    else
      sendMsg("close");
  });
}).listen(port);

var intToByteString = function (int) {
  var byteArray = [0, 0, 0, 0];
  
  for (var index = 0; index < byteArray.length; index++) {
    var byte = int & 0xff;
    byteArray [ index ] = byte;
    int = (int - byte) / 256;
  }
  
  var result = "";
  for (var i = 0; i < byteArray.length; i++) {
    result += String.fromCharCode(byteArray[i]);
  }

  return result;
};

var sendMsg = function (str) {
  if (client) {
    client.write(intToByteString(str.length) + str);
  }
}

var attack_planet = function (id_origin, id_target, num_ship) {
  sendMsg(JSON.stringify({ type: 'attack', data: { start: id_origin, end: id_target, ship_count: num_ship } }));
};

var set_name = function (ai_name) {
  sendMsg(JSON.stringify({ type: 'set_name', data: { name : ai_name } }));
};

var deathstar_destroy_planet = function (id_deathstar, id_planet_target) {
  sendMsg(JSON.stringify({ type: 'deathstar_attack', data: {deathstar: id_deathstar, end: id_planet_target}}));
};

var redirect_ship = function (id_ship, id_target) {
  sendMsg(JSON.stringify({type: 'redirect_ship', data: {id_ship: id_ship, id_target: id_target}}));
};

AI.set_game({attack_planet: attack_planet, set_name: set_name, redirect_ship: redirect_ship, deathstar_destroy_planet: deathstar_destroy_planet });