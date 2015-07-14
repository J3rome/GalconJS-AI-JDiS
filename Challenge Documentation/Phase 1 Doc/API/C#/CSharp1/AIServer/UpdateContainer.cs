using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Helpers;

namespace AIServer
{
    public class UpdateContainer
    {
        public List<Ship> Ships { get; set; }
        public List<Planet> Planets { get; set; }

        public UpdateContainer(dynamic json)
        {
            Ships = new List<Ship>();
            Planets = new List<Planet>();
            foreach(var planet in json.planets)
            {
                Planets.Add(new Planet(planet));
            }

            foreach(var ship in json.ships)
            {
                Ships.Add(new Ship(ship));
            }
        }
    }
}
