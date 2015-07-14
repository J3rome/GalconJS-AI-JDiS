using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIServer
{
    public class AI
    {
        public TCPServer Game { get; private set; }

        // Set your team Name here!!!
        private const string name = "Bot";

        public AI(TCPServer server)
        {
            Game = server;
        }

        public void update(UpdateContainer container)
        {
            Console.Out.WriteLine("Updating");
        }

        public void set_name()
        {
            Console.Out.WriteLine("Setting name");
            Game.SetName(name);
        }
    }
}
