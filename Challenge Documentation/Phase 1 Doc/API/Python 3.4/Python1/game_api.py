from server import send_msg
import json

SOCKET_CONN = None

def attack_planet(id_origin, id_target, num_ship):
    if SOCKET_CONN:
        msg = {}
        msg['type'] = 'attack'
        msg['data'] = {'start': id_origin, 'end': id_target, 'ship_count': num_ship}
        send_msg(SOCKET_CONN, json.dumps(msg))
        
def set_name(name):
    if SOCKET_CONN:
        msg = {'type': 'set_name', 'data': {'name': name}}
        send_msg(SOCKET_CONN, json.dumps(msg))