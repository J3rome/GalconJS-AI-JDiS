import game_api
import json

class AI:
    def __init__(self, conn):
        game_api.SOCKET_CONN = conn
        #Replace by your team name!
        self.name = 'BOT'
        
    def update(self, game_objects):
        #do stuff here
        print('Updating')
        
    def set_name(self):
        print('Setting Name')
        game_api.set_name(self.name)