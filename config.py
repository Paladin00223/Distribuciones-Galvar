import os

class Config:
    """Clase de configuración para la aplicación Flask."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'una_clave_secreta_muy_dificil_de_adivinar')
    
    # Configuración de MongoDB
    # CORRECCIÓN: Se ha eliminado el texto de ejemplo de la contraseña para usar solo la contraseña válida.
    MONGO_URI = "mongodb+srv://jdvargas223:wQR6UsJjkBpdACA5@cluster0.u94fmoq.mongodb.net/distritiendasgalvar?retryWrites=true&w=majority&appName=Cluster0"
    
    # Carpeta para subir archivos
    UPLOAD_FOLDER = 'static/uploads'