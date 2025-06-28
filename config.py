import os

class Config:
    """Clase de configuración para la aplicación Flask."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'una_clave_secreta_muy_dificil_de_adivinar')
    
    # Configuración de MongoDB
    MONGO_URI = "mongodb://localhost:27017/distritiendas_galvar"
    
    # Carpeta para subir archivos
    UPLOAD_FOLDER = 'static/uploads'