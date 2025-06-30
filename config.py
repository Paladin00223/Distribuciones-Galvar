import os

class Config:
    """Clase de configuración para la aplicación Flask."""
    # La SECRET_KEY es crucial para la seguridad. Se debe configurar como una variable de entorno.
    # No se proporciona un valor por defecto para forzar su configuración en producción.
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # Configuración de MongoDB
    # Se lee desde una variable de entorno para mayor seguridad.
    MONGO_URI = os.environ.get('MONGO_URI')
    
    # Carpeta para subir archivos
    UPLOAD_FOLDER = 'static/uploads'