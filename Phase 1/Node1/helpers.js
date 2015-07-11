var _ = require("underscore");


module.exports = {
  parseGameObject : function(game){
        var parsedGame = {
            myShips: [],
            myPlanets: [],
            neutralPlanets: []
        };

      if(game){
          if(game.ships){
              _.each(game.ships, function(ship){
                  if(ship.position){
                      ship.position.x = parseFloat(ship.position.x);
                      ship.position.y = parseFloat(ship.position.y);
                  }
                  if(ship.ship_count){
                      ship.ship_count = parseInt(ship.ship_count);
                  }
              });
          }

          if(game.planets){
              _.each(game.planets, function(planet){
                  if(planet.position){
                      planet.position.x = parseFloat(planet.position.x);
                      planet.position.y = parseFloat(planet.position.y);
                  }

                  if(planet.ship_count){
                      planet.ship_count = parseInt(planet.ship_count);
                  }

                  if(planet.is_deathstar == "true"){
                      planet.is_deathstar = true;
                  }else{
                      planet.is_deathstar = false;
                  }

                  if(planet.deathstar_charge){
                      planet.deathstar_charge = parseFloat(planet.deathstar_charge);
                  }

                  if(planet.size){
                      planet.size = parseFloat(planet.size);
                  }
              });
          }
      }

      console.log(game);
  }
};