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
    print("--- [1] Iniciando create_app() ---")
    app = Flask(__name__, instance_relative_config=True)

    # Cargar configuración desde el archivo config.py
    app.config.from_object('config.Config')

    # --- Verificación de variables de entorno críticas ---
    # Es una buena práctica asegurarse de que las variables esenciales estén definidas.
    # Esto hace que la aplicación falle rápidamente si el entorno no está bien configurado.
    required_vars = ['MONGO_URI', 'SECRET_KEY', 'MAIL_USERNAME', 'MAIL_PASSWORD', 'ADMIN_EMAIL']
    # Usamos os.environ.get() directamente porque app.config puede tener valores por defecto.
    missing_vars = [var for var in required_vars if not os.environ.get(var)]

    if missing_vars:
        raise RuntimeError(f"Error de configuración: Faltan las siguientes variables de entorno: {', '.join(missing_vars)}")

    # --- MEJORA DE DIAGNÓSTICO: Añadir timeout a la URI de MongoDB ---
    # Esto hará que la app falle rápidamente si no puede conectar a la base de datos.
    mongo_uri = os.environ.get('MONGO_URI')
    if mongo_uri and '?' not in mongo_uri:
        mongo_uri += '?serverSelectionTimeoutMS=5000'
    elif mongo_uri:
        mongo_uri += '&serverSelectionTimeoutMS=5000'
    app.config['MONGO_URI'] = mongo_uri

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

    print("--- [2] Configuración completada. Inicializando extensiones... ---")
    # Inicializar las extensiones con la app
    try:
        mongo.init_app(app)
        print("--- [3] Mongo.init_app() completado. ---")
        login_manager.init_app(app)
        print("--- [4] LoginManager.init_app() completado. ---")
        mail.init_app(app)
        print("--- [5] Mail.init_app() completado. ---")
        CORS(app) # Habilitar CORS para toda la aplicación
        print("--- [6] CORS(app) completado. ---")
    except Exception as e:
        print(f"!!!!!! ERROR DURANTE LA INICIALIZACIÓN DE EXTENSIONES: {e} !!!!!!")
        raise e
    
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

    print("--- [7] Extensiones inicializadas. Registrando blueprints... ---")
    with app.app_context():
        # Importar y registrar los Blueprints
        from .routes.main import main_bp
        from .routes.user import user_bp
        from .routes.admin import admin_bp
        from .routes.health import health_bp

        app.register_blueprint(main_bp)
        app.register_blueprint(user_bp)
        app.register_blueprint(admin_bp, url_prefix='/api/admin')
        app.register_blueprint(health_bp)

        print("--- [8] Blueprints registrados. App creada exitosamente. ---")
        return app