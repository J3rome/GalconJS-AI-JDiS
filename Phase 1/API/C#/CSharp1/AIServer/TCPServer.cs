using Microsoft.CSharp.RuntimeBinder;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web.Helpers;

namespace AIServer
{
    public class TCPServer
    {
        private TcpListener listener;
        private TcpClient game;
        private NetworkStream stream;
        private AI player;
        private bool isRunning;

        public TCPServer(int port)
        {
            listener = new TcpListener(IPAddress.Any, port);
            player = new AI(this);
            listener.Start();
            Start();
        }

        public void SetName(string name)
        {
            dynamic json = new ExpandoObject();
            json.type = "set_name";
            json.data = new ExpandoObject();
            json.data.name = name;

            string msg = Newtonsoft.Json.JsonConvert.SerializeObject(json);
            SendMessage(msg);
        }

        public void AttackPlanet(Planet origin, Planet target, int shipCount)
        {
            dynamic json = new ExpandoObject();
            json.type = "attack";
            json.data = new ExpandoObject();
            json.data.start = origin.Id;
            json.data.end = target.Id;
            json.data.ship_count = shipCount;

            string msg = Newtonsoft.Json.JsonConvert.SerializeObject(json);
            SendMessage(msg);
        }

        private void SendMessage(string message)
        {
            byte[] bytes = GetBytes(message);
            stream.Write(bytes, 0, bytes.Length);
        }

        private void Start()
        {
            isRunning = true;
            game = this.listener.AcceptTcpClient();
            game.NoDelay = true;
            Console.Out.WriteLine("Connected to: " + ((IPEndPoint)game.Client.RemoteEndPoint).Address.ToString());
            stream = game.GetStream();
            ReceiveData();
        }

        private void ReceiveData()
        {
            while (isRunning)
            {
                byte[] buffer = new byte[65536];
                stream.Read(buffer, 0, 4);
                int size = BitConverter.ToInt32(buffer, 0);
                stream.Read(buffer, 0, size);
                string content = Encoding.ASCII.GetString(buffer, 0, size);
                dynamic data = Json.Decode(content);
                try
                {
                    OnActionWithData(data.type, data.data);
                }
                catch (RuntimeBinderException)
                {
                    OnAction(data.type);
                }
            }

            Start();
        }

        private void OnAction(string type)
        {
            if (type == "client_end")
            {
                isRunning = false;
                SendMessage("Close");
            }
            else
            {
                MethodInfo method = player.GetType().GetMethod(type);
                method.Invoke(player, new object[] { });
            }
        }

        private void OnActionWithData(string type, dynamic data)
        {
            MethodInfo method = player.GetType().GetMethod(type);
            method.Invoke(player, new object[] { new UpdateContainer(data)});
        }

        private byte[] GetBytes(string str)
        {
            byte[] bytes = new byte[str.Length + 4];
            Buffer.BlockCopy(Encoding.ASCII.GetBytes(str), 0, bytes, 4, bytes.Length - 4);
            byte[] buffer = BitConverter.GetBytes(str.Length);
            Buffer.BlockCopy(buffer, 0, bytes, 0, 4);
            return bytes;
        }
    }
}
