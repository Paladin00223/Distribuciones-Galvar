from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from .. import mongo
from ..models import User
from ..utils import get_next_sequence_value

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
@main_bp.route('/principal')
@login_required
def principal():
    """
    Página principal para usuarios autenticados.
    Muestra las categorías de productos y la información del usuario.
    """
    # Basado en tu 'index.html', parece que tienes una colección 'categorias'
    # con campos 'nombre' e 'imagen'.
    categorias = list(mongo.db.categorias.find({}))
    
    # Obtenemos datos comunes para pasar a la plantilla
    cart_count = sum(session.get('cart', {}).values())
    cuenta = current_user.user_data.get('nombre')

    # Usamos 'index.html' que es la plantilla que contiene la estructura de la página principal
    return render_template('index.html', categorias=categorias, cart_count=cart_count, cuenta=cuenta)

@main_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.principal'))

    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user_data = mongo.db.users.find_one({'email': email})

        if user_data and check_password_hash(user_data['password'], password):
            user_obj = User(user_data)
            login_user(user_obj)
            
            # Redirigir al admin si el tipo es 'admin'
            if user_data.get('tipo') == 'admin':
                return redirect(url_for('main.admin_panel'))
            
            return redirect(url_for('main.principal'))
        else:
            flash('Email o contraseña incorrectos.', 'danger')

    return render_template('login.html')

@main_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.principal'))

    if request.method == 'POST':
        nombre = request.form.get('nombre')
        email = request.form.get('email')
        password = request.form.get('password')

        existing_user = mongo.db.users.find_one({'email': email})
        if existing_user:
            flash('El correo electrónico ya está registrado.', 'warning')
            return redirect(url_for('main.register'))

        # Obtener el último uid y sumarle 1
        new_uid = get_next_sequence_value('user_uid')

        hashed_password = generate_password_hash(password)
        
        mongo.db.users.insert_one({
            'uid': new_uid,
            'nombre': nombre,
            'email': email,
            'password': hashed_password,
            'tipo': 'usuario', # Por defecto
            'estado': 'activo' # Por defecto
        })

        flash('Registro exitoso. Ahora puedes iniciar sesión.', 'success')
        return redirect(url_for('main.login'))

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

    # Obtenemos todas las categorías para el menú desplegable de filtros
    todas_las_categorias = list(mongo.db.categorias.find({}))

    # Obtenemos datos comunes para la plantilla
    cart_count = sum(session.get('cart', {}).values())
    cuenta = current_user.user_data.get('nombre')

    return render_template('productos.html', productos=productos_filtrados, todas_las_categorias=todas_las_categorias, categoria_seleccionada=categoria_seleccionada, busqueda_actual=busqueda_actual, cart_count=cart_count, cuenta=cuenta)

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