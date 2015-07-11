var _ = require("underscore");

console.log("Hello World");

var p1 = {x: 1,y : 1};
var p2 = {x: 1,y : 1.5};
var dist = calcDist(p1,p2);

console.log("distance: "+dist);

var percentage = percentageToSend(20,5);
console.log("Ships to send:" + percentage + " %");

function calcDist(pos1,pos2)
{
	var x = pos1.x - pos2.x;
	var y = pos1.y - pos2.y;
	
	return Math.sqrt((y*y)+(x*x)); 
}

function shipsPerUpdate(size)
{
	return (5*(size-3));
}

function percentageToSend(planetShips,ShipsToSend)
{
	return (ShipsToSend/planetShips);
}

function nearestPlanetToPosition(planets,pos)
{
	
}