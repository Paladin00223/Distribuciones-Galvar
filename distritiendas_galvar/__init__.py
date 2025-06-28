import os
from flask import Flask
from flask_pymongo import PyMongo
from flask_login import LoginManager
from flask_cors import CORS
from flask_mail import Mail

# Inicializar extensiones sin una app específica
mongo = PyMongo()
login_manager = LoginManager()
mail = Mail()

def create_app():
    """Crea y configura una instancia de la aplicación Flask."""
    app = Flask(__name__, instance_relative_config=True)

    # Cargar configuración desde el archivo config.py
    app.config.from_object('config.Config')

    # Cargar configuración de correo desde config.py (o variables de entorno)
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', '1', 't']
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = ('Distritiendas Galvar', app.config['MAIL_USERNAME'])
    app.config['ADMIN_EMAIL'] = os.environ.get('ADMIN_EMAIL')

    # Asegurarse de que la carpeta de uploads exista
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    # Inicializar las extensiones con la app
    mongo.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    CORS(app) # Habilitar CORS para toda la aplicación
    
    # Configurar la vista de login para Flask-Login
    # 'main.login' -> 'main' es el nombre del blueprint, 'login' es la función de la vista
    login_manager.login_view = 'main.login'
    login_manager.login_message = "Por favor, inicia sesión para acceder a esta página."
    login_manager.login_message_category = "info"

    # Importar el modelo de usuario y definir el user_loader
    from .models import User
    @login_manager.user_loader
    def load_user(user_id):
        return User.get(user_id)

    with app.app_context():
        # Importar y registrar los Blueprints
        from .routes.main import main_bp
        from .routes.user import user_bp
        from .routes.admin import admin_bp

        app.register_blueprint(main_bp)
        app.register_blueprint(user_bp)
        app.register_blueprint(admin_bp, url_prefix='/api/admin')

        return app