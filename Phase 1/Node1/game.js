var _ = require("underscore");

console.log("Hello World");

var p1 = {x: 1,y : 1};
var p2 = {x: 1,y : 1.5};
var dist = calcDist(p1,p2);

console.log("distance: "+dist);

var percentage = percentageToSend(20,5);
console.log("Ships to send:" + percentage + " %");

var bigBertha = {id:1, position: {x: 9,y :9},ship_count:100,size:1.8,owner:"St0ners"};

var planet1 = {id:1, position: {x: 5,y :5},ship_count:50,size:1.8,owner:"St0ners"};
var planet2 = {id:2, position: {x: 7,y : 7},ship_count:23,size:1.5,owner:"St0ners"};
var planet3 = {id:3, position: {x: 2,y :2},ship_count:13,size:1.2,owner:"St0ners"};
var planet4 = {id:4, position: {x: 3,y : 3},ship_count:55,size:1.8,owner:"St0ners"};

var planets = [planet1,planet2,planet3,planet4];

var attackingShips1 = {id:1,position: {x: 10,y : 10},ship_count:20,target:1};

var nearestId = nearestPlanetToPosition(planets,p1);

console.log('nearest planet id:'+ nearestId.id);

var strongestPlanet = ourStrongestPlanet(planets);

console.log("Our strongest planet is: "+strongestPlanet.id+" with "+ strongestPlanet.ship_count+ " ships");


/*console.log("planets sorted by distance to (1,1):");
console.log(sortPlanetsByDistanceToPos(planets,p1));

console.log("Add cost for neutral planets:");
console.log(setCostForNeutralPlanets(planets));

console.log("Ships left after attacking planet:");
console.log("planet: ");
console.log(planet1);
console.log("ships: ");
console.log(attackingShips1);
console.log("Ships left: "+shipsLeftAfterEnnemyAttack(attackingShips1,planets));*/

console.log("isAttackingMe:");
console.log(isAttackingMe([attackingShips1],planets,"St0ners"));

console.log("weakest planet:");
console.log(weakestPlanet(planets,bigBertha));

function calcDist(pos1,pos2)
{
	var x = pos1.x - pos2.x;
	var y = pos1.y - pos2.y;
	
	return Math.sqrt((y*y)+(x*x)); 
}

function shipsPerUpdate(size)
{
	return ((5*size)-3);
}

function percentageToSend(planetShips,ShipsToSend)
{
	return (ShipsToSend/planetShips);
}

function nearestPlanetToPosition(planets,pos)
{
	var closestPlanet;
	var closestPlanetDistance = 999999;

	_.each(planets,function(planet) {
		var distance = calcDist(planet.position, pos);
		if (distance < closestPlanetDistance)
		{
			closestPlanet = planet;
			closestPlanetDistance = distance;
		}
	});
	return closestPlanet;
}

function ourStrongestPlanet(ourPlanets)
{
	return _.max(ourPlanets,function(planet){ return planet.ship_count});
}

function weakestPlanet(planets,ourStrongestPlanet)
{

	//En premier on sort les plannetes pour avoir les plus proches en premier
	var closestPlanets = sortPlanetsByDistanceToPos(planets,ourStrongestPlanet.position);

	//des trois premiers, on va prendre celui qui a le moins de ships:
	var weakPlanet;
	var weakPlanetShips = 9999;
	for(var i=0;i<3;i++)
	{
		if(closestPlanets[i].ship_count < weakPlanetShips)
		{
			weakPlanet = closestPlanets[i];
			weakPlanetShips = weakPlanet.ship_count;
		}
	}
	return weakPlanet;
}

function sortPlanetsByDistanceToPos(planets,pos)
{
	return _.sortBy(planets,function(planet){return calcDist(planet.position,pos)});
}

function setCostForNeutralPlanets(planets) {
	//nombre minimal de updates que ca va prendre pour
	//regagner le nombre de ships investis pour conquerir une planete

	_.each(planets, function (planet) {
		planet.cost = planet.ship_count / shipsPerUpdate(planet.size);
	});

	return planets;
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


function isAttackingMe(enemyShipsArray,allPlanets,teamName)
{
	var ennemyShipsAttackingUs = [];
	_.each(enemyShipsArray,function(enemyShips){
		console.log("Ships:");
		console.log(enemyShips);
		var attackingPlanet = _.where(allPlanets,{id:enemyShips.target})[0];
		console.log("Target:");
		console.log(attackingPlanet);
		console.log("teamname:"+teamName);
		if(attackingPlanet.owner == teamName )
		{
			console.log("WARNINGG");
			var dist = calcDist(enemyShips.position,attackingPlanet.position);
			var minShipsToDefend = attackingPlanet.ship_count - enemyShips.ship_count + 1;
			var attack = {
				shipsId: enemyShips.id,
				planetId: attackingPlanet.id,
				distance: dist,
				updatesBeforeArrival: estimatedTurnsBeforeShipsArrive(dist),
				shipsNeededToDefend: minShipsToDefend
			}
			ennemyShipsAttackingUs.push(attack);
		}
		else{
			console.log("OUFF");
		}
	})
	return ennemyShipsAttackingUs;
}

function estimatedTurnsBeforeShipsArrive(distance)
{
	var speed = 10;
	return distance/speed;
}