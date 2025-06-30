from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)

@health_bp.route('/health')
def health_check():
    """
    Un endpoint de diagnóstico simple y rápido.
    Si esto funciona, significa que la aplicación Flask y Gunicorn están corriendo.
    El problema de carga probablemente está en la ruta principal ('/').
    """
    return jsonify({"status": "ok", "message": "La aplicación está viva!"}), 200