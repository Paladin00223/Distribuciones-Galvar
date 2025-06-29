from flask_login import UserMixin
from . import mongo # Usamos import relativo

class User(UserMixin):
    def __init__(self, user_data):
        self.user_data = user_data

    def get_id(self):
        # Flask-Login requiere que el id sea un string.
        return str(self.user_data.get('uid'))

    @staticmethod
    def get(user_id):
        # user_id viene como string, lo convertimos a int para buscar por 'uid'
        if not user_id or not user_id.isdigit():
            return None
        
        user_data = mongo.db.usuarios.find_one({'uid': int(user_id)})
        if user_data:
            return User(user_data)
        return None