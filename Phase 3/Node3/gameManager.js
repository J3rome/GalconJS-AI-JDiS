var _ = require("underscore");
var teamName;
var theGame;
var gameManager;

var minimalToAttack = 10;

var nbPlanetAttackRatio = 0.5;
var attackRatio = 1/6;
var expandRatio = 3/6;
var deathstarRatio = 1/6;
var nbShipToAttack;
var nbShipForDeathstar;
var nbShipToExpand;

var magicRatio = 0.45

var nbToKeep = 5;

// Average speed of Ships : 0.0017708072818430304 dist/ms

var nbOfOurPlanetAttacking;

var updateCount = 0;
var phase = 0;

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

        var toAttack;

        var myTotalShips = 0;

        _.each(parsedGame.myPlanets, function(planet){
           myTotalShips += planet.ship_count;
        });

        console.log()

        nbOfOurPlanetAttacking = parseInt((parsedGame.myPlanets.length * nbPlanetAttackRatio)+0.5);

        if(nbOfOurPlanetAttacking == 0)
            nbOfOurPlanetAttacking = 1;

        nbShipToAttack = parseInt(myTotalShips*attackRatio);      // nb ship alloue a l'attaque
        nbShipForDeathstar = parseInt(myTotalShips*deathstarRatio);      // nb ship alloue a l'attaque de la deathstar
        nbShipToExpand = parseInt(myTotalShips*expandRatio);      // nb ship alloue a pour l<expand

        parsedGame.neutralPlanets = setCostForNeutralPlanets(parsedGame.neutralPlanets);

        addDistanceToDeathStar(parsedGame.allPlanets, parsedGame.myPlanets);

        if(phase == 0){
            console.log("Phase 0");
            var current = ourStrongestPlanet(parsedGame.myPlanets);

            var planetByDistance = sortPlanetsByDistanceToPos(parsedGame.neutralPlanets, current.position);

            toAttack = getFisrtNlowestCost(planetByDistance, 2);

            if(parsedGame.myPlanets.length < 2){
                //calcDist(planetByDistance[0].position, current.position) < minimalRayon){
                _.each(toAttack, function(attackIt){
                    gameManager.attack(current.id, attackIt.id, attackIt.ship_count + 5);
                });
                phase++;
            }/*else if(parsedGame.myPlanets.length == 3){
                console.log("++phase");
                phase++;
            }*/
        }else if(phase == 1){
            console.log("Phase 1");
            //var current = ourStrongestPlanet(parsedGame.myPlanets);
            //var weakestEnemies = weakestPlanet(parsedGame.enemiesPlanets, current);
            //var shipCount = current.ship_count/2;
            //gameManager.attack(current.id, planets.id,shipCount);

            if(updateCount < 300 || parsedGame.enemiesPlanets.length > 3) {
                // Expanding
                console.log("NbShipToExpand : "+ nbShipToExpand);
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


            // Get DeathStar infos

           /* var attackerIndex = 0;
            var attackers = bestNplanetsToAttackWith(parsedGame.myPlanets, nbOfOurPlanetAttacking,minimalToAttack);

            // Get infos if someone is attacking us
            var defendInfos = isAttackingMe(parsedGame.enemiesPlanets, parsedGame.allPlanets);
            _.each(defendInfos, function(defendPlanet){
                var isDead = false;
                toAttack = defendOrAttack(parsedGame.enemiesPlanets, getById(parsedGame.myPlanets, defendPlanet.planetId), defendPlanet.shipsNeededToDefend);

                while(!isDead && attackerIndex < attackers.length) {
                    if(attackers[attackerIndex].ship_count > (toAttack.ship_count + 2 + minimalToAttack) ){
                        gameManager.attack(attackers[attackerIndex].id, toAttack.planetId, toAttack.ship_count + 2);
                        attackerIndex++;
                        isDead = true;
                        nbShipToAttack -= toAttack.ship_count + 2;
                    }else{
                        gameManager.attack(attackers[attackerIndex].id, toAttack.planetId, toAttack.ship_count + 2 - minimalToAttack/2);    // FIX PHASE 3
                        attackerIndex++;
                        nbShipToAttack -= toAttack.ship_count + 2 - minimalToAttack/2;
                    }
                }

                // Someone is attacking us, decide weither we defend or we attack the enemie
            });*/

            var attackerIndex = 0;
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

/*
                // Nobody Attacking, we choose the best target to attack
                var enemiesToAttack = findEnnemysToAttack(parsedGame.enemiesPlanets, nbShipToAttack);

            console.log("Attacking "+enemiesToAttack.length+" ennemies");

                _.each(enemiesToAttack, function(enemie){
                    console.log("Attacking a new target");
                    var isDead = false;

                    while(!isDead && attackerIndex < attackers.length){
                        console.log("Attacking Same Target !");
                        if(attackers[attackerIndex].ship_count > (enemie.shipsToSend + minimalToAttack) ){
                            gameManager.attack(attackers[attackerIndex].id, enemie.planetId, enemie.shipsToSend);
                            attackerIndex++;
                            isDead = true;
                        }else{
                            gameManager.attack(attackers[attackerIndex].id, enemie.planetId, attackers[attackerIndex].ship_count - minimalToAttack/2);
                            attackerIndex++;
                        }
                    }
                });*/

                // NbShipToSend is 0

            }
        updateCount++;
    },

    parseGameObject: function (updatedGame) {
        var parsedGame = {
            myShips: [],
            neutralShips: [],       // DOESNT EXIST !
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
    var noDeathStar = _.reject(list, function(obj){ return obj.is_deathstar});
    return _.sortBy(noDeathStar.slice(0,N),function(obj){return obj.cost});
}

/*function weakestPlanet(planets,ourStrongestPlanet)
{
    //En premier on sort les plannetes pour avoir les plus proches en premier
    var closestPlanets = sortPlanetsByDistanceToPos(planets,ourStrongestPlanet.position);

    //des trois premiers, on va prendre celui qui a le moins de ships:
    var weakPlanet;
    var weakPlanetShips = 9999;
    for(var i=0;i<closestPlanets.length;i++)
    {
        if(!closestPlanets[i].is_deathstar && closestPlanets[i].ship_count < weakPlanetShips)
        {
            weakPlanet = closestPlanets[i];
            weakPlanetShips = weakPlanet.ship_count;
        }
    }
    return weakPlanet;
}*/

function defendPlanet(attackArray,ourPlanets)
{
    _.each(attackArray,function(attack){
        var ourBestPlanet = ourStrongestPlanet(ourPlanets);
        gameManager.attack(ourBestPlanet.id,attack.planetId,attack.shipsNeededToDefend);
    })
}

/*function shipsLeftAfterEnnemyAttack(ships,allPlanets)
{
    var attackedPlanet = _.where(allPlanets,{id:ships.target});
    /!*console.log("ShipsLeftAfterEnnemyAttack.planet = ");
     console.log(attackedPlanet[0].ship_count);
     console.log("attacker ship count");
     console.log(ships.ship_count);*!/
    return attackedPlanet[0].ship_count - ships.ship_count;
}*/


function isAttackingMe(enemyShipsArray,allPlanets)
{
    var ennemyShipsAttackingUs = [];
    _.each(enemyShipsArray,function(enemyShips){
        var attackedPlanet = _.findWhere(allPlanets,{id:enemyShips.target});
        if(attackedPlanet && attackedPlanet.owner == teamName )
        {
            console.log("We are being attacked");
            var dist = calcDist(enemyShips.position,attackedPlanet.position);
            var minShipsToDefend = attackedPlanet.ship_count - enemyShips.ship_count;
            var attack = {
                shipsId: enemyShips.id,
                planetId: attackedPlanet.id,
                distance: dist,
                updatesBeforeArrival: estimatedTurnsBeforeShipsArrive(dist),
                shipsNeededToDefend: minShipsToDefend
            }
            ennemyShipsAttackingUs.push(attack);
        }
        else{
            console.log("Nobody Attacking");
        }
    })
    return ennemyShipsAttackingUs;
}

function estimatedTurnsBeforeShipsArrive(distance)
{
    var speed = 10;
    return distance/speed;
}

function findDeathStar(list)
{
    return _.findWhere(list,{is_deathStar:true});
}

function addDistanceToDeathStar(list,deathStar)
{
    _.each(list,function(planet){
        planet.distanceToDeathStar = calcDist(deathStar.position,planet.position);
    });
}

/*function defendOrAttack(enemiesPlanets, planetToDefend, defendCost){
    var toAttack = planetToDefend;
    _.each(enemiesPlanets, function(enemiePlanet){
        if(enemiePlanet.ship_count < defendCost && enemiePlanet.ship_count < toAttack.ship_count){
            toAttack =  enemiePlanet;
        }
    });

    return toAttack;
}*/

function findDeathStar(list)
{
    return _.findWhere(list,{is_deathstar:true});
}

function addDistanceToDeathStar(allPlanet, myPlanets)
{
    var deathStar = findDeathStar(allPlanet);
    _.each(myPlanets,function(planet){
        planet.distanceToDeathStar = calcDist(deathStar.position,planet.position);
    });

    return myPlanets;
}

function bestNplanetsToAttackWith(planets,N, minimumNumberOfShipsToAttack)
{
    var planetsWithEnoughShips = _.reject(planets,function(planet){return planet.ship_count < minimumNumberOfShipsToAttack && !planet.is_deathstar});

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

function findEnnemysToAttack(enemiePlanets, myShipCount)
{
    var sortedBySize = _.sortBy(enemiePlanets,function(enemy){return enemy.size;}).reverse();
    var attackStrategy = [];
    var shipsLeft = myShipCount;


    _.each(sortedBySize,function(planet){
        if(planet.ship_count < shipsLeft)           // FIX PHASE 3
        {
            var strategy =
            {
                planetId : planet.id,
                shipsToSend : planet.ship_count + 5     // FIX PHASE 3
            };
            attackStrategy.push(strategy);
            shipsLeft = shipsLeft - strategy.shipsToSend;
        }else{
            console.log("NOT ENOUGH SHIP ON PLANET TO ATTACK !");
        }
    });

    if(attackStrategy.length == 0){
        var strategy =
        {
            planetId : sortedBySize[0].id,
            shipsToSend : sortedBySize[0].ship_count + 5     // FIX PHASE 3
        };
        attackStrategy.push(strategy)
    }

    return attackStrategy;
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

function handleDeathStar(parsedGame)
{
    var deathStarInfo = getDeathStarInfo(parsedGame.allPlanets,parsedGame.allShips);

    if(deathStarInfo.deathstar.owner != teamName)
    {
        console.log("Ennemi has deathstar ! Charge : "+deathStarInfo.deathstar.deathstar_charge + "shipCount :"+deathStarInfo.deathstar.ship_count);
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

function getEnemyBiggestPlanet(enemyPlanets)
{
    return _.max(enemyPlanets,function(planet){ return planet.size});
}

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