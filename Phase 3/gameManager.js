var _ = require("underscore");
var teamName;
var theGame;
var gameManager;

var minimalToAttack = 10;

var nbPlanetAttackRatio = 0.5;
var attackRatio = 2/6;
var expandRatio = 2/6;
var deathstarRatio = 1/6;
var nbShipToAttack;
var nbShipForDeathstar;
var nbShipToExpand;

var nbToKeep = 5;

// Average speed of Ships : 0.0017708072818430304 dist/ms

var nbOfOurPlanetAttacking;

var updateCount = 0;
var phase = 0;

module.exports = gameManager = {
    /****** Initialise certains variables ******/
    init: function(gameObject, myName) {
        console.log("JDiS AI Challenge 2015 - Jerome Abdelnour & Paulo Unia - University of Sherbrooke");
        teamName = myName;
        theGame = gameObject;
    },

    attack: function(from, to, count){
        if(from && to && count) {
            theGame.attack_planet(from, to, count);
        }
    },

    /******** Glue all the logic together ********/
    attackStrategy: function(parsedGame){
        var toAttack;

        var myTotalShips = 0;

        _.each(parsedGame.myPlanets, function(planet){
           myTotalShips += planet.ship_count;
        });

        nbOfOurPlanetAttacking = parseInt((parsedGame.myPlanets.length * nbPlanetAttackRatio)+0.5);

        if(nbOfOurPlanetAttacking == 0)
            nbOfOurPlanetAttacking = 1;

        nbShipToAttack = parseInt(myTotalShips*attackRatio);      // nb ship alloue a l'attaque
        nbShipForDeathstar = parseInt(myTotalShips*deathstarRatio);      // nb ship alloue a l'attaque de la deathstar
        nbShipToExpand = parseInt(myTotalShips*expandRatio);      // nb ship alloue a pour l<expand

        parsedGame.neutralPlanets = setCostForNeutralPlanets(parsedGame.neutralPlanets);

        addDistanceToDeathStar(parsedGame.allPlanets, parsedGame.myPlanets);

        if(phase == 0){
            var current = ourStrongestPlanet(parsedGame.myPlanets);

            var planetByDistance = sortPlanetsByDistanceToPos(parsedGame.neutralPlanets, current.position);

            toAttack = getFisrtNlowestCost(planetByDistance, 2);

            if(parsedGame.myPlanets.length < 2){
                //calcDist(planetByDistance[0].position, current.position) < minimalRayon){
                _.each(toAttack, function(attackIt){
                    gameManager.attack(current.id, attackIt.id, attackIt.ship_count + 5);
                });
                phase++;
            }

        }else if(phase == 1){
            //var current = ourStrongestPlanet(parsedGame.myPlanets);
            //var weakestEnemies = weakestPlanet(parsedGame.enemiesPlanets, current);
            //var shipCount = current.ship_count/2;
            //gameManager.attack(current.id, planets.id,shipCount);

            if(updateCount < 300 || parsedGame.enemiesPlanets.length > 3) {
                // Expanding
                var toExpand = expandStrategie(parsedGame.myPlanets, parsedGame.neutralPlanets, nbShipToExpand);
                if (toExpand) {
                    gameManager.attack(toExpand.ourPlanet.id, toExpand.neutralPlanet.id, toExpand.neededShips);
                    nbShipToExpand -= toExpand.neededShips;
                }
            }else{
                console.log("Not expanding");
                nbShipToAttack += nbShipToExpand;
                nbShipToExpand = 0;
            }

            handleDeathStar(parsedGame);

            var attackers = bestNplanetsToAttackWith(parsedGame.myPlanets, nbOfOurPlanetAttacking,minimalToAttack);

            var enemiesToAttack = findEnemy(attackers, parsedGame.enemiesPlanets);

            if(enemiesToAttack){
                gameManager.attack(enemiesToAttack.planet1.id, enemiesToAttack.destroy.id, enemiesToAttack.planet1.ship_count - nbToKeep);
                if(enemiesToAttack.planet2) {
                    gameManager.attack(enemiesToAttack.planet2.id, enemiesToAttack.destroy.id, enemiesToAttack.planet2.ship_count - nbToKeep);
                }
            }else{
                console.log("NO ENNEMIES RETURNED !");
            }
        }
        updateCount++;
    },

    /***** Parse the json provided *******/
    parseGameObject: function (updatedGame) {
        var parsedGame = {
            myShips: [],
            enemiesShips: [],
            allShips: [],
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
                    parsedGame.allShips.push(ship);
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

/****************** Attack Strategy   **************************/
function findEnemy(planetsToAttackWith,enemyPlanets)
{
    if(planetsToAttackWith.length == 0){
        return;
    }
    var weaponsInOrder = _.sortBy(planetsToAttackWith,function(planet){return planet.ship_count;}).reverse();
    var strategy;

    if(weaponsInOrder.length > 1) {
        var p1 = weaponsInOrder[0].position;
        var p2 = weaponsInOrder[1].position;
        var x = ((p1.x + p2.x) / 2) + p1.x;
        var y = ((p1.y + p2.y) / 2) + p1.y;
        var point = {x: x, y: y};


        strategy =
        {
            planet1: weaponsInOrder[0],
            planet2: weaponsInOrder[1],
            destroy: findClosestTo(enemyPlanets, point)
        };
    }else{
        strategy =
        {
            planet1: weaponsInOrder[0],
            destroy: findClosestTo(enemyPlanets, weaponsInOrder[0].position)
        };
    }

    return strategy;
}

function bestNplanetsToAttackWith(planets,N, minimumNumberOfShipsToAttack)
{
    var planetsWithEnoughShips = _.reject(planets,function(planet){return planet.ship_count < minimumNumberOfShipsToAttack && planet.is_deathstar});

    if(planetsWithEnoughShips)
    {
        var planetsInOrder = _.sortBy(planetsWithEnoughShips,function(planet){return planet.ship_count;}).reverse();

        if(planetsInOrder && planetsInOrder.length > N)
        {
            planetsInOrder = planetsInOrder.slice(0,N);
        }

        var planetsInSizeOrder = _.sortBy(planetsInOrder,function(planet){return planet.size;}).reverse();

        if(planetsInSizeOrder && planetsInSizeOrder.length > N)
        {
            return planetsInSizeOrder.slice(0,N);
        }
        else
            return planetsInSizeOrder;
    }
    return [];
}

/****************** Expansion strategy **************************/
function expandStrategie(planetsToAttackWith,neutralPlanets,shipsToSend)
{
    var strategies = [];
    _.each(neutralPlanets,function(neutral){
        strategies.push(findClosestToNeutral(neutral,planetsToAttackWith));
    });

    var bestStrat = _.sortBy(strategies,function(s){return s.score;}).reverse();
    var i = 0;
    while(i< bestStrat.length && bestStrat[i].neededShips > shipsToSend)
    {
        i++;
    }

    return bestStrat[i];
}

function findClosestToNeutral(neutralPlanet,planetsToAttackWith)
{
    var distance=9999;
    var closestPlanet;
    _.each(planetsToAttackWith,function(planet){
        var tmp = calcDist(neutralPlanet.position,planet.position);
        if( tmp < distance)
        {
            distance =tmp;
            closestPlanet = planet;
        }
    });

    var strategy = {
        neutralPlanet : neutralPlanet,
        ourPlanet : closestPlanet,
        distance : distance,
        neededShips:neutralPlanet.ship_count+4,
        score : (shipsPerUpdate*(100-estimatedTurnsBeforeShipsArrive(distance)))-neutralPlanet.ship_count+4

    };
    return strategy;
}

function setCostForNeutralPlanets(planets) {
    //nombre minimal de updates que ca va prendre pour
    //regagner le nombre de ships investis pour conquerir une planete

    _.each(planets, function (planet) {
        planet.cost = planet.ship_count / shipsPerUpdate(planet.size);
    });

    return planets;
}

/****************** DeathStar Strategy *************************/
function handleDeathStar(parsedGame)
{
    var deathStarInfo = getDeathStarInfo(parsedGame.allPlanets,parsedGame.allShips);

    if(deathStarInfo.deathstar.owner != teamName)
    {
        if(deathStarInfo.deathstar.deathstar_charge >= 0.35)
        {
            // FIX SHIP TO SEND
            var shipsToSend = (shipsPerUpdate(deathStarInfo.deathstar.size)*(7-deathStarInfo.deathstar.deathstar_charge))+
                deathStarInfo.enemyShipsIncoming - deathStarInfo.friendlyShipsIncoming;

            var isDead = false;
            var attackerIndex = 0;
            var attackers = bestNplanetsToAttackWith(parsedGame.myPlanets, nbOfOurPlanetAttacking,minimalToAttack);

            while(!isDead && attackerIndex < attackers.length && nbShipForDeathstar > 0) {
                if(attackers[attackerIndex].ship_count > (shipsToSend + minimalToAttack) ){
                    gameManager.attack(attackers[attackerIndex].id, deathStarInfo.deathstar.id, shipsToSend);
                    attackerIndex++;
                    isDead = true;
                    nbShipForDeathstar -= shipsToSend;
                }else{
                    var send;
                    if(attackers[attackerIndex].ship_count < shipsToSend - minimalToAttack/2){
                        send = attackers[attackerIndex].ship_count - minimalToAttack/2;
                    }else{
                        send = shipsToSend - minimalToAttack/2;
                    }
                    gameManager.attack(attackers[attackerIndex].id, deathStarInfo.deathstar.id, send);
                    attackerIndex++;
                    nbShipForDeathstar -= shipsToSend - minimalToAttack/2;
                }
            }
        }
    }else {
        //deathStar is ours!
        if(deathStarInfo.deathstar.deathstar_charge >= 1)
        {
            var enemyStrongestPlanet = getEnemyBiggestPlanet(parsedGame.enemiesPlanets);
            theGame.deathstar_destroy_planet(deathStarInfo.deathstar.id, enemyStrongestPlanet.id);
        }
    }
}

function getDeathStarInfo(planets,ships)
{
    var deathStar = findDeathStar(planets);

    var enemyShipsAttackingDeathStar = _.find(ships,function(ship){return (ship.target == deathStar.id && ship.owner != teamName)});
    var friendlyShipsAttackingDeathStar = _.find(ships,function(ship){return (ship.target == deathStar.id && ship.owner == teamName)});
    var totalEnemyShips = 0;
    _.each(enemyShipsAttackingDeathStar,function(ship){ totalEnemyShips += ship.ship_count;});
    var totalFriendly = 0;
    _.each(friendlyShipsAttackingDeathStar,function(ship){ totalFriendly += ship.ship_count;});

    var info = {
        deathstar : deathStar,
        enemyShipsIncoming:totalEnemyShips,
        friendlyShipsIncoming:totalFriendly
    };

    return info;
}

function addDistanceToDeathStar(allPlanet, myPlanets)
{
    var deathStar = findDeathStar(allPlanet);
    _.each(myPlanets,function(planet){
        planet.distanceToDeathStar = calcDist(deathStar.position,planet.position);
    });

    return myPlanets;
}

/***************** Search Functions ***************************/

function findClosestTo(enemyPlanets, point) {
    var distance = 9999;
    var closestPlanet;
    _.each(enemyPlanets, function (planet) {
        var tmp = calcDist(planet.position, point);
        if (tmp < distance) {
            distance = tmp;
            closestPlanet = planet;
        }
    });
    return closestPlanet;
}

function getEnemyBiggestPlanet(enemyPlanets)
{
    return _.max(enemyPlanets,function(planet){ return planet.size});
}

function findDeathStar(list)
{
    return _.findWhere(list,{is_deathstar:true});
}

function ourStrongestPlanet(ourPlanets)
{
    return _.max(ourPlanets,function(planet){ return planet.ship_count});
}

function getById(list, id){
    return _.findWhere(list,{id:id});
}

function getFisrtNlowestCost(list, N)
{
    var noDeathStar = _.reject(list, function(obj){ return obj.is_deathstar});
    return _.sortBy(noDeathStar.slice(0,N),function(obj){return obj.cost});
}


/****************** HELPERS FUNCTIONS **************************/

function calcDist(pos1,pos2)
{
    var x = pos1.x - pos2.x;
    var y = pos1.y - pos2.y;

    return Math.sqrt((y*y)+(x*x));
}

function sortPlanetsByDistanceToPos(planets,pos)
{
    return _.sortBy(planets,function(planet){return calcDist(planet.position,pos)});
}

function shipsPerUpdate(size)
{
    return ((5*size)-3);
}

function estimatedTurnsBeforeShipsArrive(distance)
{
    var speed = 10;
    return distance/speed;
}