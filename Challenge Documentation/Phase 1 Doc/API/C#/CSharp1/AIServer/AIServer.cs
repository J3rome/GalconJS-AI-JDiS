using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIServer
{
    class AIServer
    {
        static void Main(string[] args)
        {
            int port = 8888;
            if (args.Any())
                port = Int32.Parse(args[0]);

            TCPServer server = new TCPServer(port);
        }
    }
}
