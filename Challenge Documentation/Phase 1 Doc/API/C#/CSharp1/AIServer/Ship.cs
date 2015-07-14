using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Helpers;

namespace AIServer
{
    public class Ship
    {
        public int Id { get; set; }
        public float PosX { get; set; }
        public float PosY { get; set; }
        public string Owner { get; set; }
        public int ShipCount { get; set; }
        public int TargetId { get; set; }

        public Ship(dynamic json)
        {
            Id = Int32.Parse(json.id);
            TargetId = Int32.Parse(json.target);
            ShipCount = Int32.Parse(json.ship_count);
            Owner = json.owner;
            PosX = float.Parse(json.position.x,CultureInfo.InvariantCulture);
            PosY = float.Parse(json.position.y, CultureInfo.InvariantCulture);
        }
    }
}
