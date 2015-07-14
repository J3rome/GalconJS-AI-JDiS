var _ = require("underscore");
var teamName;
var theGame;

// Average speed of Ships : 0.0017708072818430304 dist/ms

var updateCount = 0;

var minimalRayon = 5;

var phase = 0;

var lastAttacked;

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

        parsedGame.neutralPlanets = setCostForNeutralPlanets(parsedGame.neutralPlanets);

        if(phase == 0){
            console.log("Phase 0");
            var current = ourStrongestPlanet(parsedGame.myPlanets);

            var planetByDistance = sortPlanetsByDistanceToPos(parsedGame.neutralPlanets, current.position);

            var toAttack = getFisrtNlowestCost(planetByDistance, 2);

            if(parsedGame.myPlanets.length < 2){
                //calcDist(planetByDistance[0].position, current.position) < minimalRayon){



                lastAttacked = planetByDistance[0];
                _.each(toAttack, function(attackIt){
                    gameManager.attack(current.id, attackIt.id, attackIt.ship_count + 5);
                });
            }else if(parsedGame.myPlanets.length == 3){
                console.log("++phase");
                phase++;
            }
        }else if(phase == 1){
            console.log("Phase 1");
            var current = ourStrongestPlanet(parsedGame.myPlanets);
            var planets = weakestPlanet(parsedGame.enemiesPlanets, current);
            var shipCount = current.ship_count/2;
            gameManager.attack(current.id, planets.id,shipCount );
        }

        updateCount++;
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

function setCostForNeutralPlanets(planets) {
    //nombre minimal de updates que ca va prendre pour
    //regagner le nombre de ships investis pour conquerir une planete

    _.each(planets, function (planet) {
        planet.cost = planet.ship_count / shipsPerUpdate(planet.size);
    });

    return planets;
}

function sortPlanetsByDistanceToPos(planets,pos)
{
    return _.sortBy(planets,function(planet){return calcDist(planet.position,pos)});
}

function ourStrongestPlanet(ourPlanets)
{
    return _.max(ourPlanets,function(planet){ return planet.ship_count});
}

function shipsPerUpdate(size)
{
    return ((5*size)-3);
}

function getById(list, id){
    return _.findWhere(list,{id:id});
}

function getFisrtNlowestCost(list, N)
{
    return _.sortBy(list.slice(0,N),function(obj){return obj.cost});
}

function weakestPlanet(planets,ourStrongestPlanet)
{
    //En premier on sort les plannetes pour avoir les plus proches en premier
    var closestPlanets = sortPlanetsByDistanceToPos(planets,ourStrongestPlanet.position);

    //des trois premiers, on va prendre celui qui a le moins de ships:
    var weakPlanet;
    var weakPlanetShips = 9999;
    for(var i=0;i<closestPlanets.length;i++)
    {
        if(closestPlanets[i].ship_count < weakPlanetShips)
        {
            weakPlanet = closestPlanets[i];
            weakPlanetShips = weakPlanet.ship_count;
        }
    }
    return weakPlanet;
}