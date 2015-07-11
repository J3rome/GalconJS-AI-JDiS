var _ = require("underscore");
var teamName;
var theGame;

// Average speed of Ships : 0.0017708072818430304 dist/ms

// Testing
var attacked;
var count =0;
var attackTime;

var t = 0.0015308232561668347 + 0.0018389404174685405 + 0.002015802125211825 + 0.001635774815079226 + 0.0018326957952887267;
console.log("Moyenne "+t/5);

module.exports = gameManager = {
    init: function(gameObject, myName) {
        teamName = myName;
        theGame = gameObject;
    },

    attack: function(from, to, count){
        if(from && to && count) {
            theGame.attack_planet(from, to, count);
        }
    },

    test: function(parsedGame){
        if(count == 0){
            attacked = parsedGame.neutralPlanets[0];
            attackTime = Date.now();
            this.attack(parsedGame.myPlanets[0].id, attacked.id, 1);
            count++;
        }else if(count ==1){
            var planet = _.findWhere(parsedGame.neutralPlanets, {id:attacked.id});

            if(planet.ship_count < attacked.ship_count){
                var time = Date.now() - attackTime;
                var distance = calcDist(parsedGame.myPlanets[0].position,attacked.position);
                console.log("Took "+time+" ms for distance : "+distance+" Speed : "+distance/time);
                count++;
            }
        }
    },

    attackStrategy: function(parsedGame){
        var shipsCount = 1;
        console.log("Attacking '"+parsedGame.enemiesPlanets[0].owner+"' from '"+parsedGame.myPlanets[0].owner+"' with '"+shipsCount+"'.");
        this.attack(parsedGame.myPlanets[0].id, parsedGame.enemiesPlanets[0].id, shipsCount);
        this.attack(parsedGame.myPlanets[0].id, parsedGame.neutralPlanets[0].id, shipsCount);
    },

    parseGameObject: function (updatedGame) {
        var parsedGame = {
            myShips: [],
            neutralShips: [],       // DOESNT EXIST !
            enemiesShips: [],
            myPlanets: [],
            neutralPlanets: [],
            enemiesPlanets: [],
            allPlanets: []
        };

        if (updatedGame) {
            if (updatedGame.ships) {
                _.each(updatedGame.ships, function (ship) {
                    if (ship.position) {
                        ship.position.x = parseFloat(ship.position.x);
                        ship.position.y = parseFloat(ship.position.y);
                    }

                    if (ship.ship_count) {
                        ship.ship_count = parseInt(ship.ship_count);
                    }

                    if (ship.owner == teamName) {
                        parsedGame.myShips.push(ship);
                    } else if (ship.owner == "") {
                        parsedGame.neutralShips.push(ship);
                    } else {
                        parsedGame.enemiesShips.push(ship);
                    }
                });
            }

            if (updatedGame.planets) {
                _.each(updatedGame.planets, function (planet) {
                    if (planet.position) {
                        planet.position.x = parseFloat(planet.position.x);
                        planet.position.y = parseFloat(planet.position.y);
                    }

                    if (planet.ship_count) {
                        planet.ship_count = parseInt(planet.ship_count);
                    }

                    if (planet.is_deathstar == "true") {
                        planet.is_deathstar = true;
                    } else {
                        planet.is_deathstar = false;
                    }

                    if (planet.deathstar_charge) {
                        planet.deathstar_charge = parseFloat(planet.deathstar_charge);
                    }

                    if (planet.size) {
                        planet.size = parseFloat(planet.size);
                    }

                    if (planet.owner == teamName) {
                        parsedGame.myPlanets.push(planet);
                    } else if (planet.owner == "") {
                        parsedGame.neutralPlanets.push(planet);
                    } else {
                        parsedGame.enemiesPlanets.push(planet);
                    }

                    parsedGame.allPlanets.push(planet);
                });
            }
        }

        return parsedGame;
    }
};

function calcDist(pos1,pos2)
{
    var x = pos1.x - pos2.x;
    var y = pos1.y - pos2.y;

    return Math.sqrt((y*y)+(x*x));
}