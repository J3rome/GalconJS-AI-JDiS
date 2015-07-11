var _ = require("underscore");
var teamName;
var theGame;
var gameManager;

var minimalToAttack = 10;

var nbPlanetAttackRatio = 0.5;
var attackRatio = 1/2;
var expandRatio = 1/6;
var deathstarRatio = 1/6;

// Average speed of Ships : 0.0017708072818430304 dist/ms

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



        parsedGame.neutralPlanets = setCostForNeutralPlanets(parsedGame.neutralPlanets);

        addDistanceToDeathStar(parsedGame.allPlanets, parsedGame.myPlanets);

        console.log(parsedGame.myPlanets);

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
            }else if(parsedGame.myPlanets.length == 3){
                console.log("++phase");
                phase++;
            }
        }else if(phase == 1){
            console.log("Phase 1");
            //var current = ourStrongestPlanet(parsedGame.myPlanets);
            //var weakestEnemies = weakestPlanet(parsedGame.enemiesPlanets, current);
            //var shipCount = current.ship_count/2;
            //gameManager.attack(current.id, planets.id,shipCount);

            var nbOfOurPlanetAttacking = parseInt((parsedGame.myPlanets.length * nbPlanetAttackRatio)+0.5);

            if(nbOfOurPlanetAttacking == 0)
                nbOfOurPlanetAttacking = 1;

            // Get DeathStar infos


            var nbShipToSend = parseInt(myTotalShips*attackRatio);      // nb ship alloue a l'attaque

            var attackerIndex = 0;
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
                        nbShipToSend -= toAttack.ship_count + 2;
                    }else{
                        gameManager.attack(attackers[attackerIndex].id, toAttack.planetId, toAttack.ship_count + 2 - minimalToAttack);
                        attackerIndex++;
                        nbShipToSend -= toAttack.ship_count + 2 - minimalToAttack;
                    }
                }

                // Someone is attacking us, decide weither we defend or we attack the enemie
            });

            attackerIndex = 0;
            attackers = bestNplanetsToAttackWith(parsedGame.myPlanets, nbOfOurPlanetAttacking,minimalToAttack);







                // Nobody Attacking, we choose the best target to attack



                var enemiesToAttack = findEnnemysToAttack(parsedGame.enemiesPlanets, nbShipToSend);



                _.each(enemiesToAttack, function(enemie){
                    var isDead = false;

                    while(!isDead && attackerIndex < attackers.length){
                        if(attackers[attackerIndex].ship_count > (enemie.shipsToSend + minimalToAttack) ){
                            gameManager.attack(attackers[attackerIndex].id, enemie.planetId, enemie.shipsToSend);
                            attackerIndex++;
                            isDead = true;
                        }else{
                            gameManager.attack(attackers[attackerIndex].id, enemie.planetId, attackers[attackerIndex].ship_count - minimalToAttack);
                            attackerIndex++;
                        }
                    }
                });

                // NbShipToSend is 0

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
    var noDeathStar = _.reject(list, function(obj){ return obj.is_deathstar});
    return _.sortBy(noDeathStar.slice(0,N),function(obj){return obj.cost});
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
        if(!closestPlanets[i].is_deathstar && closestPlanets[i].ship_count < weakPlanetShips)
        {
            weakPlanet = closestPlanets[i];
            weakPlanetShips = weakPlanet.ship_count;
        }
    }
    return weakPlanet;
}

function defendPlanet(attackArray,ourPlanets)
{
    _.each(attackArray,function(attack){
        var ourBestPlanet = ourStrongestPlanet(ourPlanets);
        gameManager.attack(ourBestPlanet.id,attack.planetId,attack.shipsNeededToDefend);
    })
}

function shipsLeftAfterEnnemyAttack(ships,allPlanets)
{
    var attackedPlanet = _.where(allPlanets,{id:ships.target});
    /*console.log("ShipsLeftAfterEnnemyAttack.planet = ");
     console.log(attackedPlanet[0].ship_count);
     console.log("attacker ship count");
     console.log(ships.ship_count);*/
    return attackedPlanet[0].ship_count - ships.ship_count;
}


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

function defendOrAttack(enemiesPlanets, planetToDefend, defendCost){
    var toAttack = planetToDefend;
    _.each(enemiesPlanets, function(enemiePlanet){
        if(enemiePlanet.ship_count < defendCost && enemiePlanet.ship_count < toAttack.ship_count){
            toAttack =  enemiePlanet;
        }
    });

    return toAttack;
}

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

function findEnnemysToAttack(nemyPlanets, myShipCount)
{
    var sortedBySize = _.sortBy(nemyPlanets,function(enemy){return enemy.size;}).reverse();
    var attackStrategy = [];
    var shipsLeft = myShipCount;


    _.each(sortedBySize,function(planet){
        if(planet.ship_count < shipsLeft)
        {
            var strategy =
            {
                planetId : planet.id,
                shipsToSend : planet.ship_count + 5
            };
            attackStrategy.push(strategy);
            shipsLeft = shipsLeft - strategy.shipsToSend;
        }
    });

    return attackStrategy;
}