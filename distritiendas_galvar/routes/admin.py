import io, csv, os, datetime
from flask import Blueprint, jsonify, request, url_for, Response, current_app
from functools import wraps
from flask_login import current_user, login_required
from werkzeug.utils import secure_filename
from bson.objectid import ObjectId
from bson.errors import InvalidId

from .. import mongo

admin_bp = Blueprint('admin', __name__)

# Decorador para verificar si el usuario es administrador
def admin_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.user_data.get('tipo') != 'admin':
            return jsonify({'success': False, 'message': 'Acceso no autorizado'}), 403
        return f(*args, **kwargs)
    return decorated_function

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Productos ---

@admin_bp.route('/products', methods=['GET'])
@admin_required
def get_products():
    page = int(request.args.get('page', 1))
    limit = 10
    search_term = request.args.get('search', '').strip()
    skip = (page - 1) * limit

    query = {}
    if search_term:
        regex = {'$regex': search_term, '$options': 'i'}
        query['$or'] = [{'nombre': regex}, {'categoria': regex}]

    products_cursor = mongo.db.products.find(query).skip(skip).limit(limit)
    total_products = mongo.db.products.count_documents(query)
    total_pages = (total_products + limit - 1) // limit

    products = []
    for p in products_cursor:
        p['_id'] = str(p['_id'])
        products.append(p)

    return jsonify({
        'success': True,
        'products': products,
        'total_pages': total_pages,
        'current_page': page
    })

@admin_bp.route('/products/<product_id>', methods=['GET'])
@admin_required
def get_product_by_id(product_id):
    try:
        product = mongo.db.products.find_one({"_id": ObjectId(product_id)})
        if product:
            product['_id'] = str(product['_id'])
            return jsonify({"success": True, "product": product})
        return jsonify({"success": False, "message": "Producto no encontrado."}), 404
    except InvalidId:
        return jsonify({"success": False, "message": "ID de producto inválido."}), 400

@admin_bp.route('/products', methods=['POST'])
@admin_required
def add_product():
    if 'nombre' not in request.form:
        return jsonify({'success': False, 'message': 'Faltan campos obligatorios'}), 400

    imagen_filename = None
    if 'imagen' in request.files:
        file = request.files['imagen']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], 'products', filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            file.save(filepath)
            imagen_filename = filename

    new_product = {
        'nombre': request.form.get('nombre'),
        'descripcion': request.form.get('descripcion'),
        'precio': float(request.form.get('precio', 0)),
        'stock': int(request.form.get('stock', 0)),
        'categoria': request.form.get('categoria'),
        'imagen': imagen_filename,
        'fecha_creacion': datetime.datetime.utcnow()
    }
    result = mongo.db.products.insert_one(new_product)
    return jsonify({'success': True, 'message': 'Producto añadido exitosamente', 'id': str(result.inserted_id)}), 201

@admin_bp.route('/products/<product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    try:
        update_fields = {}
        if 'nombre' in request.form:
            update_fields['nombre'] = request.form['nombre']
        if 'descripcion' in request.form:
            update_fields['descripcion'] = request.form['descripcion']
        if 'precio' in request.form:
            update_fields['precio'] = float(request.form['precio'])
        if 'stock' in request.form:
            update_fields['stock'] = int(request.form['stock'])
        if 'categoria' in request.form:
            update_fields['categoria'] = request.form['categoria']

        if 'imagen' in request.files:
            file = request.files['imagen']
            if file and file.filename != '' and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], 'products', filename)
                os.makedirs(os.path.dirname(filepath), exist_ok=True)
                file.save(filepath)
                update_fields['imagen'] = filename

        if not update_fields:
            return jsonify({'success': False, 'message': 'No se proporcionaron datos para actualizar.'}), 400

        result = mongo.db.products.update_one({'_id': ObjectId(product_id)}, {'$set': update_fields})
        if result.matched_count == 0:
            return jsonify({'success': False, 'message': 'Producto no encontrado.'}), 404
        return jsonify({'success': True, 'message': 'Producto actualizado exitosamente.'})
    except InvalidId:
        return jsonify({'success': False, 'message': 'ID de producto inválido.'}), 400

    except (ValueError, TypeError) as e:
        return jsonify({'success': False, 'message': f'Error en el formato de los datos: {e}'}), 400
@admin_bp.route('/products/<product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    try:
        product_to_delete = mongo.db.products.find_one({'_id': ObjectId(product_id)})
        result = mongo.db.products.delete_one({'_id': ObjectId(product_id)})
        if result.deleted_count == 0:
            return jsonify({'success': False, 'message': 'Producto no encontrado.'}), 404
        
        if product_to_delete and product_to_delete.get('imagen'):
            image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'products', product_to_delete['imagen'])
            if os.path.exists(image_path):
                os.remove(image_path)

        return jsonify({'success': True, 'message': 'Producto eliminado exitosamente.'})
    except InvalidId:
        return jsonify({'success': False, 'message': 'ID de producto inválido.'}), 400

# --- Usuarios ---

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    page = int(request.args.get('page', 1))
    limit = 10
    search_term = request.args.get('search', '').strip()
    skip = (page - 1) * limit

    query = {}
    if search_term:
        regex = {'$regex': search_term, '$options': 'i'}
        search_conditions = [{'nombre': regex}, {'email': regex}]
        if search_term.isdigit():
            search_conditions.append({'uid': int(search_term)})
        query['$or'] = search_conditions

    # CORRECCIÓN: Usar el nombre de colección correcto 'usuarios'
    users_cursor = mongo.db.usuarios.find(query, {'password': 0}).sort('uid', 1).skip(skip).limit(limit)
    total_users = mongo.db.usuarios.count_documents(query)
    total_pages = (total_users + limit - 1) // limit

    users = []
    for u in users_cursor:
        u['_id'] = str(u['_id'])
        users.append(u)

    return jsonify({
        'success': True,
        'users': users,
        'total_pages': total_pages,
        'current_page': page
    })

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    # CORRECCIÓN: Usar el nombre de colección correcto 'usuarios'
    user = mongo.db.usuarios.find_one({'uid': user_id}, {'password': 0})
    if not user:
        return jsonify({'success': False, 'message': 'Usuario no encontrado'}), 404
    user['_id'] = str(user['_id'])
    return jsonify(user)

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    data = request.json
    
    # MEJORA: Usar una lista blanca de campos para mayor seguridad.
    allowed_fields = ['nombre', 'nombre_unico', 'email', 'tipo', 'estado', 'puntos', 'cedula', 'paquete']
    update_fields = {k: v for k, v in data.items() if k in allowed_fields}

    if not update_fields:
        return jsonify({'success': False, 'message': 'No hay campos válidos para actualizar.'}), 400

    # CORRECCIÓN: Usar el nombre de colección correcto 'usuarios'
    result = mongo.db.usuarios.update_one({'uid': user_id}, {'$set': update_fields})
    if result.matched_count == 0:
        return jsonify({'success': False, 'message': 'Usuario no encontrado.'}), 404
    return jsonify({'success': True, 'message': 'Usuario actualizado exitosamente.'})

@admin_bp.route('/users/<int:user_id>/deactivate', methods=['POST'])
@admin_required
def deactivate_user(user_id):
    """
    Desactiva un usuario en lugar de eliminarlo para mantener la integridad de los datos (pedidos).
    """
    # CORRECCIÓN: Convertir el id del usuario actual a entero para una comparación correcta.
    if user_id == int(current_user.get_id()):
        return jsonify({'success': False, 'message': 'No puedes desactivar tu propia cuenta.'}), 403

    # CORRECCIÓN: Usar el nombre de colección correcto 'usuarios'
    result = mongo.db.usuarios.update_one({'uid': user_id}, {'$set': {'estado': 'inactivo'}})
    if result.matched_count == 0:
        return jsonify({'success': False, 'message': 'Usuario no encontrado.'}), 404
    return jsonify({'success': True, 'message': 'Usuario desactivado exitosamente.'})

# --- Pedidos ---

def _build_orders_pipeline(status_filter, search_term):
    pipeline = [
        # CORRECCIÓN: Usar el nombre de colección correcto 'usuarios' en el lookup.
        {'$lookup': {'from': 'usuarios', 'localField': 'user_uid', 'foreignField': 'uid', 'as': 'customer_info'}},
        {'$unwind': {'path': '$customer_info', 'preserveNullAndEmptyArrays': True}}
    ]
    match_stage = {}
    if status_filter and status_filter.lower() != 'todos':
        match_stage['status'] = {'$regex': f'^{status_filter}$', '$options': 'i'}
    if search_term:
        regex = {'$regex': search_term, '$options': 'i'}
        search_conditions = [{'customer_info.nombre': regex}, {'shipping_info.name': regex}]
        # MEJORA: Búsqueda por ID de pedido más robusta.
        try:
            # Intentar convertir el término de búsqueda a ObjectId
            search_conditions.append({'_id': ObjectId(search_term)})
        except InvalidId:
            # Si no es un ObjectId válido, no hacer nada y continuar con la búsqueda de texto
            pass
        match_stage['$or'] = search_conditions
    if match_stage:
        pipeline.append({'$match': match_stage})
    return pipeline

def _process_order_for_json(order):
    """
    Convierte los campos de un pedido (ObjectId, datetime) a formatos serializables.
    """
    order['_id'] = str(order['_id'])
    if isinstance(order.get('order_date'), datetime.datetime):
        order['order_date'] = order['order_date'].isoformat()
    for item in order.get('items', []):
        if isinstance(item.get('product_id'), ObjectId):
            item['product_id'] = str(item['product_id'])
    return order

@admin_bp.route('/orders')
@admin_required
def get_orders():
    status_filter = request.args.get('status')
    search_term = request.args.get('search', '').strip()
    page = int(request.args.get('page', 1))
    limit = 10
    skip = (page - 1) * limit

    base_pipeline = _build_orders_pipeline(status_filter, search_term)
    count_pipeline = base_pipeline + [{'$count': 'total'}]
    count_result = list(mongo.db.pedidos.aggregate(count_pipeline))
    total_orders = count_result[0]['total'] if count_result else 0
    total_pages = (total_orders + limit - 1) // limit

    data_pipeline = base_pipeline + [{'$sort': {'order_date': -1}}, {'$skip': skip}, {'$limit': limit}]
    orders = list(mongo.db.pedidos.aggregate(data_pipeline))

    for order in orders:
        _process_order_for_json(order)

    return jsonify({'orders': orders, 'total_pages': total_pages, 'current_page': page})

@admin_bp.route('/order_details/<order_id>')
@admin_required
def get_order_details(order_id):
    try:
        pipeline = _build_orders_pipeline(None, None)
        pipeline.insert(0, {'$match': {'_id': ObjectId(order_id)}})
        result = list(mongo.db.pedidos.aggregate(pipeline))
        if not result:
            return jsonify({'success': False, 'message': 'Pedido no encontrado'}), 404
        
        order = _process_order_for_json(result[0])
        
        return jsonify({'success': True, 'order': order})
    except InvalidId:
        return jsonify({'success': False, 'message': 'ID de pedido inválido'}), 400

@admin_bp.route('/orders/<order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    new_status = request.json.get('status')
    if not new_status:
        return jsonify({'success': False, 'message': 'Nuevo estado es requerido'}), 400

    try:
        result = mongo.db.pedidos.update_one({'_id': ObjectId(order_id)}, {'$set': {'status': new_status}})
        if result.matched_count == 0:
            return jsonify({'success': False, 'message': 'Pedido no encontrado.'}), 404
        return jsonify({'success': True, 'message': 'Estado del pedido actualizado.'})
    except InvalidId:
        return jsonify({'success': False, 'message': 'ID de pedido inválido.'}), 400

@admin_bp.route('/export_orders_csv')
@admin_required
def export_orders_csv():
    status_filter = request.args.get('status')
    search_term = request.args.get('search', '').strip()
    pipeline = _build_orders_pipeline(status_filter, search_term) + [{'$sort': {'order_date': -1}}]
    orders = list(mongo.db.pedidos.aggregate(pipeline))

    output = io.StringIO()
    writer = csv.writer(output)
    headers = ['ID Pedido', 'Fecha', 'Estado', 'Monto Total', 'Cliente', 'Email Cliente', 'Productos']
    writer.writerow(headers)

    for order in orders:
        items_str = "; ".join([f"{item.get('nombre', 'N/A')} (x{item.get('cantidad', 0)})" for item in order.get('items', [])])
        row = [
            order.get('order_uid', str(order.get('_id'))),
            order.get('order_date').strftime('%Y-%m-%d %H:%M:%S') if isinstance(order.get('order_date'), datetime.datetime) else 'N/A',
            order.get('status', 'N/A'),
            order.get('total_amount', 0),
            order.get('customer_info', {}).get('nombre', 'N/A'),
            order.get('customer_info', {}).get('email', 'N/A'),
            items_str
        ]
        writer.writerow(row)

    output.seek(0)
    return Response(output, mimetype="text/csv", headers={"Content-Disposition":"attachment;filename=pedidos.csv"})

# --- Dashboard ---

@admin_bp.route('/dashboard_stats')
@admin_required
def get_dashboard_stats():
    total_orders = mongo.db.pedidos.count_documents({})
    revenue_result = list(mongo.db.pedidos.aggregate([
        {'$match': {'status': 'Entregado'}},
        {'$group': {'_id': None, 'total': {'$sum': '$total_amount'}}}
    ]))
    total_revenue = revenue_result[0]['total'] if revenue_result else 0
    total_users = mongo.db.usuarios.count_documents({})
    one_month_ago = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    recent_orders = mongo.db.pedidos.count_documents({'order_date': {'$gte': one_month_ago}})

    stats = {
        'total_orders': total_orders,
        'total_revenue': total_revenue,
        'total_users': total_users,
        'recent_orders': recent_orders
    }
    return jsonify({'success': True, 'stats': stats})

@admin_bp.route('/monthly_revenue')
@admin_required
def get_monthly_revenue():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    match_stage = {'status': 'Entregado'}
    if start_date_str:
        match_stage['order_date'] = {'$gte': datetime.datetime.strptime(start_date_str, '%Y-%m-%d')}
    if end_date_str:
        match_stage.setdefault('order_date', {})['$lt'] = datetime.datetime.strptime(end_date_str, '%Y-%m-%d') + datetime.timedelta(days=1)

    pipeline = [
        {'$match': match_stage},
        {'$group': {
            '_id': {'year': {'$year': '$order_date'}, 'month': {'$month': '$order_date'}},
            'total_revenue': {'$sum': '$total_amount'}
        }},
        {'$sort': {'_id.year': 1, '_id.month': 1}}
    ]
    revenue_data = list(mongo.db.pedidos.aggregate(pipeline))

    labels = []
    values = []
    month_names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    for data in revenue_data:
        labels.append(f"{month_names[data['_id']['month'] - 1]} {data['_id']['year']}")
        values.append(data['total_revenue'])

    return jsonify({'success': True, 'data': {'labels': labels, 'values': values}})