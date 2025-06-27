from flask import Flask, render_template, jsonify, request, session, redirect, url_for, flash
# Importamos la librería pymongo para con
from pymongo import MongoClient
# Importamos ObjectId para poder buscar por _id en MongoDB
from bson.errors import InvalidId
from bson.errors import InvalidId
# Herramientas para contraseñas seguras
from werkzeug.security import generate_password_hash, check_password_hash
# Importamos flask_cors para poder enviar
from flask_cors import CORS #CORS: Inter
import os, datetime, certifi

#Creamo la aplicación con Flask
app = Flask(__name__)
app.secret_key = 'tu_clave_secreta_super_dificil_de_adivinar' # ¡IMPORTANTE! Cambia esto

#Habilitamos CORS en nuestra API
CORS(app)

# --- Conexión a MongoDB (para productos y categorías) ---

#Conectamos la cadena de conexión a la BD
MONGO_URI = "mongodb+srv://jdvargas223:JDvargas223#@cluster0.u94fmoq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# COnectamos con la BD mongo mediante la
mongo = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
# Seleccionamos la base de datos
base_datos = mongo.distritiendasgalvar
# Seleccionamos la colección
coleccion_usuarios = base_datos.usuarios # Añadido: Definir la colección de usuarios
coleccion_categorias = base_datos.categorias
coleccion_productos = base_datos.productos
coleccion_pedidos = base_datos.pedidos # Nueva colección para los pedidos

# --- Helper para IDs numéricos de usuario ---
def get_next_user_id():
    """
    Obtiene el siguiente valor de la secuencia para los IDs de usuario numéricos.
    """
    sequence_document = base_datos.counters.find_one_and_update(
        {'_id': 'user_uid'},
        {'$inc': {'sequence_value': 1}},
        return_document=ReturnDocument.AFTER,
        upsert=True # Crea el contador si no existe
    )
    return sequence_document['sequence_value']
# --- Helper function ---
def sort_categories(category_list):
    """Ordena una lista de diccionarios de categorías para colocar 'Otros' al final."""
    def sort_key(cat):
        if cat.get('nombre', '').lower() == 'otros':
            return (1, cat.get('nombre')) # Asigna una prioridad mayor a 'Otros'
        return (0, cat.get('nombre')) # Prioridad normal para el resto
    
    category_list.sort(key=sort_key)
    return category_list

# --- Rutas para la tienda (MongoDB) ---

# Definimos las rutas de la aplicación para la tienda
@app.route("/", methods=["GET"])
def principal():
    categorias = list(coleccion_categorias.find())
    categorias = sort_categories(categorias) # Ordenamos la lista
    #Convertimos los ids a cadena de caracteres
    for item in categorias:
        item["_id"] = str(item["_id"])

    # También consultamos los productos para que estén disponibles en la página principal
    productos = list(coleccion_productos.find())
    # Convertimos los ids a cadena de caracteres
    for item in productos:
        item["_id"] = str(item["_id"])
    
    # Obtenemos el nombre del usuario si ha iniciado sesión
    nombre_usuario = None
    if 'user_email' in session:
        usuario = coleccion_usuarios.find_one({'email': session['user_email']})
        if usuario:
            nombre_usuario = usuario.get('nombre')
            
    # Enviamos la lista de videos al archivo html
    return render_template("index.html", categorias=categorias, productos=productos, cuenta=nombre_usuario)

@app.route("/productos", methods=["GET"])
def productos():
    # 1. Obtener los parámetros de la URL (?categoria=...&buscar=...)
    categoria_filtro = request.args.get('categoria', 'todo')
    termino_busqueda = request.args.get('buscar', '')

    # 2. Construir la consulta para MongoDB
    query = {}

    # 3. Aplicar filtro por categoría (si no es 'todo')
    if categoria_filtro and categoria_filtro.lower() != 'todo':
        # Búsqueda insensible a mayúsculas/minúsculas para la categoría
        query['categoria'] = {'$regex': f'^{categoria_filtro}$', '$options': 'i'}

    # 4. Aplicar filtro por término de búsqueda (en nombre y descripción)
    if termino_busqueda:
        # Búsqueda de texto insensible a mayúsculas/minúsculas
        regex_search = {'$regex': termino_busqueda, '$options': 'i'}
        query['$or'] = [
            {'nombre': regex_search},
            {'descripcion': regex_search}
        ]

    # 5. Ejecutar la consulta y obtener todas las categorías para el dropdown
    productos_filtrados = list(coleccion_productos.find(query))
    todas_las_categorias = list(coleccion_categorias.find())
    todas_las_categorias = sort_categories(todas_las_categorias) # Ordenamos la lista

    # Obtenemos el nombre del usuario si ha iniciado sesión
    nombre_usuario = None
    if 'user_email' in session:
        usuario = coleccion_usuarios.find_one({'email': session['user_email']})
        if usuario:
            nombre_usuario = usuario.get('nombre')

    # 6. Renderizar la plantilla con los resultados
    return render_template("productos.html", productos=productos_filtrados, 
                           todas_las_categorias=todas_las_categorias,
                           categoria_seleccionada=categoria_filtro,
                           busqueda_actual=termino_busqueda,
                           cuenta=nombre_usuario,
                           cart_count=sum(session.get('cart', {}).values())
                           )


# --- Rutas de Autenticación y Usuarios (MongoDB) ---

@app.route('/register', methods=['GET','POST'])
def register():
    if request.method == 'GET':
        # Si es una solicitud GET, simplemente renderiza la página de registro
        return render_template('register.html')

    # Procesar el formulario en caso de POST
    nombre_unico = request.form.get('nombre_unico')
    password = request.form.get('password')
    nombre = request.form.get('nombre') # Opcional
    phone = request.form.get('phone') # Opcional
    email = request.form.get('email') # Opcional

    if not nombre_unico or not password:
        flash('El nombre de usuario y la contraseña son obligatorios.', 'error')
        return redirect(url_for('register'))

    # Verificar si el nombre de usuario ya existe
    if coleccion_usuarios.find_one({'nombre_unico': nombre_unico}):
        flash('Ese nombre de usuario ya está en uso. Por favor, elige otro.', 'error')
        return redirect(url_for('register'))

    # Verificar si el email ya existe (si se proporcionó)
    if email and coleccion_usuarios.find_one({'email': email}):
        flash('El correo electrónico ya está registrado.', 'error')
        return redirect(url_for('register'))

    # Verificar si el teléfono ya existe (si se proporcionó)
    if phone and coleccion_usuarios.find_one({'phone': phone}):
        flash('El número de celular ya está registrado.', 'error')
        return redirect(url_for('register'))

    hashed_password = generate_password_hash(password)

    nuevo_usuario = {
        'uid': get_next_user_id(), # Asignar nuevo ID numérico
        'nombre_unico': nombre_unico,
        'password': hashed_password,
        'nombre': nombre,
        'phone': phone,
        'email': email,
        'puntos': 0,
        'estado': 'activo',
        'tipo': 'usuario',
        'ultimo_acceso': datetime.datetime.now(),
        'fecha_creacion': datetime.datetime.now()
    }
    # Limpiar campos opcionales que estén vacíos para no guardarlos como ""
    nuevo_usuario = {k: v for k, v in nuevo_usuario.items() if v is not None and v != ''}

    coleccion_usuarios.insert_one(nuevo_usuario)
    flash('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success')
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

    # Procesar el formulario en caso de POST
    identifier = request.form.get('identifier')
    password = request.form.get('password')

    if not identifier or not password:
        flash('Todos los campos son requeridos.', 'error')
        return redirect(url_for('login'))

    # Buscar usuario por nombre_unico, email o phone
    user = coleccion_usuarios.find_one({'$or': [{'nombre_unico': identifier}, {'email': identifier}, {'phone': identifier}]})

    if user and check_password_hash(user.get('password', ''), password):
        # Contraseña correcta, actualizamos último acceso y creamos la sesión
        coleccion_usuarios.update_one(
            {'_id': user['_id']},
            {'$set': {'ultimo_acceso': datetime.datetime.now()}}
        )

        session['user_id'] = user.get('uid') # Guardar el ID numérico en la sesión
        session['user_email'] = user.get('email') # Puede ser None
        session['user_type'] = user.get('tipo', 'usuario') # Usar .get para evitar KeyError si no existe

        # Redirigir al panel de admin si es admin, si no a la página principal
        if session.get('user_type') == 'admin':
            return redirect(url_for('admin_panel'))
        return redirect(url_for('principal'))
    else:
        # Usuario no encontrado o contraseña incorrecta
        flash('Credenciales inválidas. Por favor, inténtalo de nuevo.', 'error')
        return redirect(url_for('login'))

@app.route('/logout')
def logout():
    session.clear() # Elimina todos los datos de la sesión
    flash('Has cerrado sesión exitosamente.', 'success')
    return redirect(url_for('login')) # Redirige a la página de login

@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    if 'cart' not in session:
        session['cart'] = {}

    data = request.get_json() # Esto ya es correcto para recibir JSON
    product_id = data.get('product_id') # Accede a la clave 'product_id' del JSON
    cantidad = int(data.get('cantidad', 1))

    if not product_id:
        return jsonify({'error': 'Product ID is required'}), 400

    if product_id in session['cart']:
        session['cart'][product_id] += cantidad
    else:
        session['cart'][product_id] = cantidad

    session.modified = True  # Necesario para guardar los cambios en la sesión
    cart_count = sum(session['cart'].values())
    return jsonify({'message': 'Product added to cart', 'cart_count': cart_count})


@app.route('/remove_from_cart', methods=['POST'])
def remove_from_cart():
    data = request.get_json()
    product_id = data.get('product_id')

    if not product_id:
        return jsonify({'success': False, 'message': 'Product ID is required'}), 400

    # Verificar que el carrito y el producto existan en la sesión antes de eliminar
    if 'cart' in session and product_id in session['cart']:
        # Eliminar el producto del diccionario del carrito
        del session['cart'][product_id]
        session.modified = True  # Marcar la sesión como modificada

        # Recalcular el total y el conteo de productos
        total_price = 0
        if session['cart']:
            product_ids = [ObjectId(pid) for pid in session['cart'].keys()]
            products_in_db = coleccion_productos.find({'_id': {'$in': product_ids}})
            products_map = {str(p['_id']): p for p in products_in_db}

            for pid, quantity in session['cart'].items():
                product_data = products_map.get(pid)
                if product_data:
                    total_price += product_data.get('precio', 0) * quantity
        
        cart_count = sum(session.get('cart', {}).values())

        return jsonify({'success': True, 'message': 'Producto eliminado', 'new_total': total_price, 'cart_count': cart_count})
    
    return jsonify({'success': False, 'message': 'Producto no encontrado en el carrito'}), 404


@app.route('/update_cart_item', methods=['POST'])
def update_cart_item():
    data = request.get_json()
    product_id = data.get('product_id')
    new_quantity = data.get('new_quantity')

    # --- Validación de los datos recibidos ---
    if not product_id or new_quantity is None:
        return jsonify({'success': False, 'message': 'Faltan datos (ID o cantidad).'}), 400
    
    try:
        new_quantity = int(new_quantity)
        if new_quantity < 1:
            return jsonify({'success': False, 'message': 'La cantidad debe ser al menos 1.'}), 400
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Formato de cantidad inválido.'}), 400

    # --- Actualización de la sesión ---
    if 'cart' in session and product_id in session['cart']:
        session['cart'][product_id] = new_quantity
        session.modified = True

        # --- Recalcular totales y devolverlos ---
        total_price = 0
        new_subtotal = 0
        
        product_data = coleccion_productos.find_one({'_id': ObjectId(product_id)})
        if product_data:
            new_subtotal = product_data.get('precio', 0) * new_quantity
        
        product_ids = [ObjectId(pid) for pid in session['cart'].keys()]
        products_in_db = coleccion_productos.find({'_id': {'$in': product_ids}})
        products_map = {str(p['_id']): p for p in products_in_db}

        for pid, quantity in session['cart'].items():
            product_data = products_map.get(pid)
            if product_data:
                total_price += product_data.get('precio', 0) * quantity
        
        cart_count = sum(session.get('cart', {}).values())

        return jsonify({
            'success': True, 
            'new_total': total_price, 
            'new_subtotal': new_subtotal,
            'cart_count': cart_count
        })
    
    return jsonify({'success': False, 'message': 'Producto no encontrado en el carrito.'}), 404


@app.route('/checkout', methods=['POST'])
def checkout():
    # 1. Verificar si el usuario está logueado
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Debes iniciar sesión para comprar.'}), 401

    # 2. Verificar si el carrito está vacío
    if 'cart' not in session or not session['cart']:
        return jsonify({'success': False, 'message': 'Tu carrito está vacío.'}), 400

    # 3. Obtener datos de envío del formulario
    shipping_data = request.get_json()
    required_fields = ['name', 'address', 'phone', 'email']
    if not shipping_data or not all(field in shipping_data and shipping_data[field] for field in required_fields):
        return jsonify({'success': False, 'message': 'Falta información de envío.'}), 400

    # 4. Procesar el pedido, obteniendo precios actuales de la BD para seguridad
    items_for_order = []
    total_price = 0
    
    product_ids = [ObjectId(pid) for pid in session['cart'].keys()]
    products_in_db = coleccion_productos.find({'_id': {'$in': product_ids}})
    products_map = {str(p['_id']): p for p in products_in_db}

    for product_id, quantity in session['cart'].items():
        product_data = products_map.get(product_id)
        if product_data:
            price_at_purchase = product_data.get('precio', 0)
            items_for_order.append({
                'product_id': ObjectId(product_id),
                'nombre': product_data.get('nombre'),
                'precio_compra': price_at_purchase,
                'cantidad': quantity
            })
            total_price += price_at_purchase * quantity

    # 5. Crear el documento del pedido
    order_document = {
        'user_uid': session['user_id'], # Guardar el ID numérico del usuario
        'shipping_info': shipping_data,
        'items': items_for_order,
        'total_amount': total_price,
        'status': 'Pendiente', # Otros estados: Procesando, Enviado, Entregado, Cancelado
        'order_date': datetime.datetime.now()
    }

    # 6. Guardar el pedido, limpiar carrito y devolver éxito
    result = coleccion_pedidos.insert_one(order_document)
    session.pop('cart', None)
    return jsonify({'success': True, 'message': '¡Compra realizada con éxito!', 'order_id': str(result.inserted_id)})

# --- Rutas de ejemplo para la navegación (evitan errores) ---
@app.route('/buy')
def buy():
    # Obtenemos el nombre del usuario si ha iniciado sesión
    nombre_usuario = None
    if 'user_email' in session:
        usuario = coleccion_usuarios.find_one({'email': session['user_email']})
        if usuario:
            nombre_usuario = usuario.get('nombre')

    if 'cart' not in session or not session['cart']:
        # Si no hay carrito o está vacío, muestra la página con un carrito vacío.
        return render_template('buy.html', items=[], total=0, cuenta=nombre_usuario)

    cart_items = []
    total_price = 0

    # Obtenemos los IDs de los productos del carrito y los convertimos a ObjectId
    product_ids = [ObjectId(pid) for pid in session['cart'].keys()]

    # Buscamos todos los productos en la base de datos de una sola vez
    products_in_db = coleccion_productos.find({'_id': {'$in': product_ids}})

    # Creamos un mapa de productos para un acceso más rápido
    products_map = {str(p['_id']): p for p in products_in_db}

    for product_id, quantity in session['cart'].items():
        product_data = products_map.get(product_id)
        if product_data:
            price = product_data.get('precio', 0)
            subtotal = price * quantity
            total_price += subtotal
            cart_items.append({
                'id': product_id,
                'nombre': product_data.get('nombre'),
                'precio': price,
                'cantidad': quantity,
                'subtotal': subtotal,
                'imagen': product_data.get('imagen')
            })

    return render_template('buy.html', items=cart_items, total=total_price, cuenta=nombre_usuario)

@app.route('/compras')
def compras():
    # 1. Verificar si el usuario está logueado
    if 'user_id' not in session:
        flash('Debes iniciar sesión para ver tu historial de compras.', 'error')
        return redirect(url_for('login'))

    user_uid = session['user_id']
    
    # Obtenemos el nombre del usuario para la plantilla
    nombre_usuario = None
    usuario = coleccion_usuarios.find_one({'uid': user_uid})
    if usuario:
        nombre_usuario = usuario.get('nombre')

    # 2. Obtener los pedidos del usuario desde la base de datos, ordenados por fecha descendente
    pedidos = list(coleccion_pedidos.find({'user_uid': user_uid}).sort('order_date', -1))
    
    # 3. Formatear datos para la plantilla
    for pedido in pedidos:
        pedido['_id'] = str(pedido['_id'])
        pedido['fecha_formateada'] = pedido['order_date'].strftime('%d/%m/%Y %H:%M')

    return render_template('compras.html', 
                           pedidos=pedidos, 
                           cuenta=nombre_usuario)

@app.route('/order_details/<order_id>')
def order_details(order_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    try:
        pedido = coleccion_pedidos.find_one({
            '_id': ObjectId(order_id),
            'user_uid': session['user_id']
        })

        if not pedido:
            return jsonify({'success': False, 'message': 'Pedido no encontrado'}), 404
        
        # Convertir ObjectIds a strings para que sean serializables en JSON
        pedido['_id'] = str(pedido['_id'])
        for item in pedido.get('items', []):
            item['product_id'] = str(item['product_id'])
        
        # Formatear la fecha
        pedido['order_date'] = pedido['order_date'].isoformat()

        return jsonify({'success': True, 'order': pedido})
    except InvalidId:
        return jsonify({'success': False, 'message': 'ID de pedido inválido'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/cancel_order', methods=['POST'])
def cancel_order():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401
    
    data = request.get_json()
    order_id = data.get('order_id')

    if not order_id:
        return jsonify({'success': False, 'message': 'ID de pedido requerido'}), 400

    try:
        result = coleccion_pedidos.update_one(
            {'_id': ObjectId(order_id), 'user_uid': session['user_id'], 'status': 'Pendiente'},
            {'$set': {'status': 'Cancelado'}}
        )

        if result.matched_count == 0:
            return jsonify({'success': False, 'message': 'No se pudo cancelar el pedido (puede que ya no esté pendiente).'}), 404
        
        return jsonify({'success': True, 'message': 'Pedido cancelado exitosamente.'})
    except InvalidId:
        return jsonify({'success': False, 'message': 'ID de pedido inválido'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
@app.route('/perfil')
def perfil():
    # Aquí podrías redirigir al login si no hay sesión
    return "Página de Perfil de Usuario (en construcción)"

@app.route('/admin')
def admin_panel():
    if session.get('user_type') != 'admin':
        flash('Acceso no autorizado.', 'error')
        return redirect(url_for('principal'))
    return render_template('admin.html', user_id=session.get('user_id'))

@app.route('/api/admin/orders')
def api_admin_orders():
    if session.get('user_type') != 'admin':
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    pipeline = [
        {
            '$sort': {'order_date': -1} # Ordenar por fecha descendente
        },
        {
            '$lookup': {
                'from': 'usuarios',
                'localField': 'user_uid',
                'foreignField': 'uid',
                'as': 'customer_info'
            }
        },
        {
            '$unwind': { # Desenrollar el array de customer_info
                'path': '$customer_info',
                'preserveNullAndEmptyArrays': True # Mantener pedidos incluso si el usuario fue eliminado
            }
        }
    ]
    all_orders = list(coleccion_pedidos.aggregate(pipeline))

    # Serializar datos para JSON (convertir ObjectId y fechas)
    for order in all_orders:
        order['_id'] = str(order['_id'])
        order['order_date'] = order['order_date'].isoformat()
        if order.get('customer_info'):
            order['customer_info']['_id'] = str(order['customer_info']['_id'])

    return jsonify(all_orders)

# --- API para Administración (Usuarios) ---

@app.route('/api/admin/users', methods=['GET'])
def get_users():
    if session.get('user_type') != 'admin':
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    usuarios = list(coleccion_usuarios.find())
    for user in usuarios:
        user['_id'] = str(user['_id']) # Convertir ObjectId a string
    return jsonify(usuarios)

@app.route('/api/admin/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    if session.get('user_type') != 'admin':
        return jsonify({'success': False, 'message': 'No autorizado'}), 401
    
    try:
        user = coleccion_usuarios.find_one({'uid': user_id})
        if not user:
            return jsonify({'success': False, 'message': 'Usuario no encontrado'}), 404
        
        user['_id'] = str(user['_id']) # Convertir ObjectId a string para JSON
        # No enviar el hash de la contraseña al frontend
        user.pop('password', None)

        return jsonify(user)
    except InvalidId:
        return jsonify({'success': False, 'message': 'ID de usuario inválido'}), 400


@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    if session.get('user_type') != 'admin':
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    data = request.json

    update_fields = {}
    for field in ['nombre', 'email', 'cedula', 'documento', 'paquete', 'puntos', 'estado', 'tipo']:
        if field in data:
            update_fields[field] = data[field]

    if 'password' in data and data['password']:
        update_fields['password'] = generate_password_hash(data['password'])

    if not update_fields:
        return jsonify({'success': False, 'message': 'No se proporcionaron campos para actualizar.'}), 400

    try:
        # La línea clave: debe usar 'uid' y 'user_id'
        result = coleccion_usuarios.update_one(
            {'uid': user_id}, # <-- ¡Asegúrate de que sea 'uid': user_id!
            {'$set': update_fields}
        )

        if result.matched_count == 0:
            return jsonify({'success': False, 'message': 'Usuario no encontrado.'}), 404

        return jsonify({'success': True, 'message': 'Usuario actualizado exitosamente.'})

    except InvalidId:
        return jsonify({'success': False, 'message': 'ID de usuario inválido.'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error al actualizar usuario: {str(e)}'}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if session.get('user_type') != 'admin':
        return jsonify({'success': False, 'message': 'No autorizado'}), 401

    # Comprobación de seguridad para evitar la auto-eliminación
    if user_id == session.get('user_id'):
        return jsonify({'success': False, 'message': 'No puedes eliminar tu propia cuenta de administrador.'}), 403 # 403 Forbidden

    try:
        result = coleccion_usuarios.delete_one({'uid': user_id})

        if result.deleted_count == 0:
            return jsonify({'success': False, 'message': 'Usuario no encontrado.'}), 404
        
        return jsonify({'success': True, 'message': 'Usuario eliminado exitosamente.'})
    except InvalidId:
        return jsonify({'success': False, 'message': 'ID de usuario inválido.'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Ejecuta la aplicación principal
if __name__ == "__main__":
    # --- Migración de datos única para IDs de usuario numéricos ---
    # Comprueba si el administrador ya tiene un 'uid' para evitar ejecutar esto varias veces.
    admin_user_check = coleccion_usuarios.find_one({'tipo': 'admin'})
    if admin_user_check and 'uid' not in admin_user_check:
        print("Iniciando migración de datos única para IDs de usuario...")

        # 1. Asignar UID 0 al primer administrador encontrado
        coleccion_usuarios.update_one(
            {'_id': admin_user_check['_id']},
            {'$set': {'uid': 0}}
        )
        print(f"Usuario administrador '{admin_user_check.get('nombre_unico')}' asignado con UID 0.")

        # 2. Inicializar el contador de secuencias en 0
        base_datos.counters.update_one(
            {'_id': 'user_uid'},
            {'$set': {'sequence_value': 0}},
            upsert=True
        )

        # 3. Asignar UIDs secuenciales al resto de usuarios
        other_users = coleccion_usuarios.find({'uid': {'$exists': False}})
        for user in other_users:
            next_id = get_next_user_id()
            coleccion_usuarios.update_one({'_id': user['_id']}, {'$set': {'uid': next_id}})
            print(f"Usuario '{user.get('nombre_unico')}' asignado con UID {next_id}.")

        # 4. Actualizar todos los pedidos existentes con los nuevos UIDs
        all_orders = list(coleccion_pedidos.find({'user_uid': {'$exists': False}}))
        if all_orders:
            print("Actualizando pedidos con los nuevos UIDs...")
            for order in all_orders:
                # Encontrar el usuario al que pertenece el pedido usando el ObjectId original
                user_of_order = coleccion_usuarios.find_one({'_id': order['user_id']})
                if user_of_order and 'uid' in user_of_order:
                    # Si se encuentra el usuario y tiene un uid, actualizar el pedido
                    coleccion_pedidos.update_one(
                        {'_id': order['_id']},
                        {'$set': {'user_uid': user_of_order['uid']}}
                    )
    app.run(host='0.0.0.0', port=5000, debug=True)