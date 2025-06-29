import re
from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from .. import mongo
from ..models import User
from ..utils import get_next_sequence_value

main_bp = Blueprint('main', __name__)

@main_bp.app_context_processor
def inject_common_data():
    """
    Inyecta variables comunes en el contexto de todas las plantillas.
    Ahora 'cart_count' y 'user_name' estarán disponibles en todos los templates.
    """
    if not current_user.is_authenticated:
        return {}
        
    cart_count = sum(session.get('cart', {}).values())
    user_name = current_user.user_data.get('nombre')
    
    return dict(cart_count=cart_count, user_name=user_name)

@main_bp.route('/')
@main_bp.route('/principal')
@login_required
def principal():
    categorias = list(mongo.db.categorias.find({}))
    return render_template('index.html', categorias=categorias)

@main_bp.route('/login', methods=['GET', 'POST'])
def login():
    # Si el usuario ya está autenticado, redirigirlo
    if current_user.is_authenticated:
        # Para una petición GET, simplemente redirigir
        if request.method == 'GET':
            return redirect(url_for('main.principal'))
        # Para una petición POST (AJAX), devolver un JSON indicando que ya está logueado
        else:
            redirect_url = url_for('main.admin_panel') if current_user.user_data.get('tipo') == 'admin' else url_for('main.principal')
            return jsonify({'success': True, 'message': 'Ya has iniciado sesión.', 'redirect_url': redirect_url})

    if request.method == 'POST':
        # Esta es la petición AJAX que viene de login.js, por lo que usamos get_json()
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Petición inválida.'}), 400

        # CORRECCIÓN CLAVE: Limpiar espacios en blanco del identificador
        identifier = data.get('email')
        if not identifier:
            return jsonify({'success': False, 'message': 'El email o usuario es requerido.'}), 400
        identifier = identifier.strip()
        # CORRECCIÓN: Asegurarse de que 'password' sea siempre una cadena para evitar errores.
        password = data.get('password') or ''
        
        # CORRECCIÓN: Realizar una búsqueda insensible a mayúsculas/minúsculas.
        # Esto soluciona el problema si el usuario escribe "administrador" en lugar de "Administrador".
        insensitive_identifier_regex = re.compile(f'^{re.escape(identifier)}$', re.IGNORECASE)

        # Búsqueda mejorada en la base de datos
        # CORRECCIÓN: Usar el nombre de colección correcto 'usuarios'
        user_data = mongo.db.usuarios.find_one({
            "$or": [
                {'email': insensitive_identifier_regex},
                {'nombre_unico': insensitive_identifier_regex}, # Para usuarios nuevos
                {'nombre': insensitive_identifier_regex}       # Para usuarios antiguos (retrocompatibilidad)
            ]
        })

        if user_data and check_password_hash(user_data.get('password', ''), password):
            user_obj = User(user_data)
            login_user(user_obj)
            
            # Determinar a dónde redirigir y enviarlo en la respuesta JSON
            redirect_url = url_for('main.admin_panel') if user_data.get('tipo') == 'admin' else url_for('main.principal')
            return jsonify({'success': True, 'redirect_url': redirect_url})
        else:
            return jsonify({'success': False, 'message': 'Email o contraseña incorrectos.'}), 401

    return render_template('login.html')

@main_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.principal'))

    # Para peticiones POST (AJAX desde register.js)
    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Petición inválida. No se recibieron datos.'}), 400

        nombre = data.get('nombre')
        email = data.get('email')
        password = data.get('password')

        # Validación básica en el backend
        if not all([nombre, email, password]):
            return jsonify({'success': False, 'message': 'Todos los campos son requeridos.'}), 400

        # MEJORA: Añadir validación de fortaleza de la contraseña
        if len(password) < 8:
            return jsonify({'success': False, 'message': 'La contraseña debe tener al menos 8 caracteres.'}), 400

        # MEJORA: Validación de unicidad insensible a mayúsculas/minúsculas
        email_regex = re.compile(f'^{re.escape(email)}$', re.IGNORECASE)
        nombre_regex = re.compile(f'^{re.escape(nombre)}$', re.IGNORECASE)

        if mongo.db.usuarios.find_one({'email': email_regex}):
            # 409 Conflict es un código de estado más apropiado
            return jsonify({'success': False, 'message': 'El correo electrónico ya está registrado.'}), 409
        
        # También se podría buscar en el campo 'nombre' para usuarios antiguos
        if mongo.db.usuarios.find_one({'$or': [{'nombre_unico': nombre_regex}, {'nombre': nombre_regex}]}):
            return jsonify({'success': False, 'message': 'Ese nombre de usuario ya está en uso. Por favor, elige otro.'}), 409

        new_uid = get_next_sequence_value('user_uid')
        hashed_password = generate_password_hash(password)
        
        mongo.db.usuarios.insert_one({
            'uid': new_uid,
            'nombre': nombre,
            'nombre_unico': nombre, # <-- AQUÍ ESTÁ LA CORRECCIÓN CLAVE
            'email': email,
            'password': hashed_password,
            'tipo': 'usuario',
            'estado': 'activo'
        })

        # 201 Created es el código de estado para una creación exitosa
        return jsonify({
            'success': True, 
            'message': 'Registro exitoso. Serás redirigido para iniciar sesión.', 
            'redirect_url': url_for('main.login')
        }), 201

    # Para peticiones GET, simplemente mostrar la página de registro
    return render_template('register.html')

@main_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Has cerrado sesión exitosamente.', 'success')
    return redirect(url_for('main.login'))

@main_bp.route('/productos')
@login_required
def productos():
    """
    Página de productos que permite filtrar por categoría y búsqueda.
    """
    # Obtenemos los parámetros de filtrado de la URL
    categoria_seleccionada = request.args.get('categoria', 'todo')
    busqueda_actual = request.args.get('buscar', '').strip()

    # Construimos la consulta a la base de datos dinámicamente
    query = {}
    if categoria_seleccionada and categoria_seleccionada != 'todo':
        # Búsqueda insensible a mayúsculas/minúsculas para la categoría
        query['categoria'] = {'$regex': f'^{categoria_seleccionada}$', '$options': 'i'}
    
    if busqueda_actual:
        regex = {'$regex': busqueda_actual, '$options': 'i'}
        query['$or'] = [{'nombre': regex}, {'descripcion': regex}]

    # Obtenemos los productos que coinciden con los filtros
    productos_filtrados = list(mongo.db.products.find(query))

    todas_las_categorias = list(mongo.db.categorias.find({}))

    return render_template('productos.html', productos=productos_filtrados, todas_las_categorias=todas_las_categorias, categoria_seleccionada=categoria_seleccionada, busqueda_actual=busqueda_actual)

@main_bp.route('/admin')
@login_required
def admin_panel():
    if current_user.user_data.get('tipo') != 'admin':
        flash('Acceso no autorizado.', 'danger')
        return redirect(url_for('main.principal'))
    return render_template('admin.html', user_id=current_user.get_id())

@main_bp.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        # Obtener todas las categorías únicas de la colección de productos
        categories = mongo.db.products.distinct("categoria")
        # Filtrar valores nulos o vacíos si los hubiera
        categories = [cat for cat in categories if cat]
        return jsonify(categories)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500