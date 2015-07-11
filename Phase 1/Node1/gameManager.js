var _ = require("underscore");
var teamName;
var theGame;

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

    attackStrategy: function(parsedGame){
        var shipsCount = 1;
        console.log("Attacking '"+parsedGame.enemiesPlanets[0].owner+"' from '"+parsedGame.myPlanets[0].owner+"' with '"+shipsCount+"'.");
        this.attack(parsedGame.myPlanets[0].id, parsedGame.enemiesPlanets[0].id, shipsCount);
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