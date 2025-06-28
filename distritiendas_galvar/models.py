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
        try:
            user_id_int = int(user_id)
            user_data = mongo.db.users.find_one({'uid': user_id_int})
            if user_data:
                return User(user_data)
        except (ValueError, TypeError):
            return None
        return None