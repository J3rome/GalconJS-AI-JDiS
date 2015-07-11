import socket
import sys
import struct
import AI
import json

HOST = '127.0.0.1'
PORT = 8888

COMPUTER = None
CONNECTION = None

def send_msg(sock, msg):
    # Prefix each message with a 4-byte length (network byte order)
    msg = struct.pack('<I', len(msg)) + msg
    sock.sendall(msg)

def recv_msg(sock):
    # Read message length and unpack it into an integer
    raw_msglen = recvall(sock, 4)
    if not raw_msglen:
        return None

    msglen = struct.unpack('<I', raw_msglen)[0]
    # Read the message data
    return recvall(sock, msglen)

def recvall(sock, n):
    # Helper function to recv n bytes or return None if EOF is hit
    data = ''
    while len(data) < n:
        packet = sock.recv(n - len(data))
        if not packet:
            return None
        data += packet
    return data

def parse_data(data):
    object = json.loads(data)
    if object['type'] == "client_end":
        global CONNECTION
        send_msg(CONNECTION, "close")
        print("Connection ended")
        accept_connection()
    else:
        to_call = getattr(COMPUTER, object['type'])
        if to_call:
            if 'data' in object:
                to_call(object['data'])
            else:
                to_call()

def accept_connection():
    global CONNECTION
    global COMPUTER
    CONNECTION, addr = s.accept()
    print('Connected with ' + addr[0] + ':' + str(addr[1]))
    COMPUTER = AI.AI(CONNECTION)
    
if __name__ == "__main__":
    if len(sys.argv) > 1:
        PORT = int(sys.argv[1])
    
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind((HOST, PORT))
        s.listen(1)
    except socket.error as msg:
        print('Bind failed. Error Code : ' + str(msg))
        sys.exit()
    
    accept_connection()
    while 1:
        data = recv_msg(CONNECTION)
        if data is not None:
            parse_data(data)