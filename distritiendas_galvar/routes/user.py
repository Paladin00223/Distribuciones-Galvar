from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify, current_app
from flask_login import login_required, current_user, logout_user
from bson.objectid import ObjectId
from bson.errors import InvalidId
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

from .. import mongo
from ..utils import get_next_sequence_value, send_order_emails

user_bp = Blueprint('user', __name__)

def _calculate_cart_totals(cart):
    """
    Calcula el subtotal de cada item y el total general del carrito.
    Devuelve una tupla: (lista de items con subtotal, total general).
    """
    if not cart:
        return [], 0

    cart_items = []
    total_price = 0
    if cart:
        product_ids = [ObjectId(pid) for pid in cart.keys()]
        products_in_db = mongo.db.products.find({'_id': {'$in': product_ids}})
        products_map = {str(p['_id']): p for p in products_in_db}

        for product_id, quantity in cart.items():
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
    
    return cart_items, total_price


@user_bp.route('/buy')
@login_required
def buy():
    cart = session.get('cart', {})
    if not cart:
        return render_template('buy.html', items=[], total=0)

    cart_items, total_price = _calculate_cart_totals(cart)
    return render_template('buy.html', items=cart_items, total=total_price)

@user_bp.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    if 'cart' not in session:
        session['cart'] = {}

    data = request.get_json()
    product_id = data.get('product_id')
    cantidad = int(data.get('cantidad', 1))

    if not product_id:
        return jsonify({'success': False, 'message': 'Product ID is required'}), 400

    session['cart'][product_id] = session.get('cart', {}).get(product_id, 0) + cantidad
    session.modified = True
    cart_count = sum(session['cart'].values())
    return jsonify({'success': True, 'message': 'Product added to cart', 'cart_count': cart_count})

@user_bp.route('/remove_from_cart', methods=['POST'])
def remove_from_cart():
    data = request.get_json()
    product_id = data.get('product_id')

    if 'cart' in session and product_id in session['cart']:
        del session['cart'][product_id]
        session.modified = True

        _, total_price = _calculate_cart_totals(session.get('cart', {}))
        cart_count = sum(session.get('cart', {}).values())
        return jsonify({'success': True, 'message': 'Producto eliminado', 'new_total': total_price, 'cart_count': cart_count})
    
    return jsonify({'success': False, 'message': 'Producto no encontrado en el carrito'}), 404

@user_bp.route('/update_cart_item', methods=['POST'])
def update_cart_item():
    data = request.get_json()
    product_id = data.get('product_id')
    new_quantity = data.get('new_quantity')

    try:
        new_quantity = int(new_quantity)
        if new_quantity < 1:
            return jsonify({'success': False, 'message': 'La cantidad debe ser al menos 1.'}), 400
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Formato de cantidad inválido.'}), 400

    if 'cart' in session and product_id in session['cart']:
        session['cart'][product_id] = new_quantity
        session.modified = True

        # Recalcular totales
        new_subtotal = 0
        product_data = mongo.db.products.find_one({'_id': ObjectId(product_id)})
        if product_data:
            new_subtotal = product_data.get('precio', 0) * new_quantity
        
        _, total_price = _calculate_cart_totals(session.get('cart', {}))
        cart_count = sum(session.get('cart', {}).values())
        return jsonify({'success': True, 'new_total': total_price, 'new_subtotal': new_subtotal, 'cart_count': cart_count})
    
    return jsonify({'success': False, 'message': 'Producto no encontrado en el carrito.'}), 404

@user_bp.route('/checkout', methods=['POST'])
@login_required
def checkout():
    cart = session.get('cart', {})
    if not cart:
        return jsonify({'success': False, 'message': 'Tu carrito está vacío.'}), 400

    shipping_data = request.get_json()
    if not all(shipping_data.get(field) for field in ['name', 'address', 'phone', 'email']):
        return jsonify({'success': False, 'message': 'Falta información de envío.'}), 400

    # REUTILIZACIÓN: Usar la función auxiliar para obtener los items y el total.
    cart_items, total_price = _calculate_cart_totals(cart)

    if not cart_items:
        return jsonify({'success': False, 'message': 'Los productos en tu carrito ya no están disponibles.'}), 400

    items_for_order = [
        {
            'product_id': ObjectId(item['id']),
            'nombre': item['nombre'],
            'precio_compra': item['precio'],
            'cantidad': item['cantidad']
        } for item in cart_items
    ]

    order_document = {
        'order_uid': get_next_sequence_value('order_uid'),
        'user_uid': int(current_user.get_id()),
        'shipping_info': shipping_data,
        'items': items_for_order,
        'total_amount': total_price,
        'status': 'Pendiente',
        'order_date': datetime.datetime.utcnow()
    }

    result = mongo.db.pedidos.insert_one(order_document)

    if result.inserted_id:
        send_order_emails(order_document, current_app._get_current_object())

    session.pop('cart', None)
    return jsonify({'success': True, 'message': '¡Compra realizada con éxito!', 'order_id': order_document['order_uid']})

@user_bp.route('/compras')
@login_required
def compras():
    user_uid = int(current_user.get_id())
    pedidos = list(mongo.db.pedidos.find({'user_uid': user_uid}).sort('order_date', -1))
    for pedido in pedidos:
        pedido['_id'] = str(pedido['_id'])
        pedido['fecha_formateada'] = pedido['order_date'].strftime('%d/%m/%Y %H:%M')
    return render_template('compras.html', pedidos=pedidos)

@user_bp.route('/order_details/<order_id>')
@login_required
def order_details(order_id):
    try:
        pedido = mongo.db.pedidos.find_one({'_id': ObjectId(order_id), 'user_uid': int(current_user.get_id())})
        if not pedido:
            return jsonify({'success': False, 'message': 'Pedido no encontrado'}), 404
        
        pedido['_id'] = str(pedido['_id'])
        for item in pedido.get('items', []):
            item['product_id'] = str(item['product_id'])
        pedido['order_date'] = pedido['order_date'].isoformat()
        return jsonify({'success': True, 'order': pedido})
    except InvalidId:
        return jsonify({'success': False, 'message': 'ID de pedido inválido'}), 400

@user_bp.route('/cancel_order', methods=['POST'])
@login_required
def cancel_order():
    order_id = request.get_json().get('order_id')
    try:
        result = mongo.db.pedidos.update_one(
            {'_id': ObjectId(order_id), 'user_uid': int(current_user.get_id()), 'status': 'Pendiente'},
            {'$set': {'status': 'Cancelado'}}
        )
        if result.matched_count == 0:
            return jsonify({'success': False, 'message': 'No se pudo cancelar el pedido (puede que ya no esté pendiente).'}), 404
        return jsonify({'success': True, 'message': 'Pedido cancelado exitosamente.'})
    except InvalidId:
        return jsonify({'success': False, 'message': 'ID de pedido inválido'}), 400

@user_bp.route('/perfil')
@login_required
def perfil():
    user_uid = int(current_user.get_id())
    # CORRECCIÓN: Usar el nombre de colección correcto 'usuarios'
    user_data = mongo.db.usuarios.find_one({'uid': user_uid}, {'password': 0})

    if not user_data:
        flash('Usuario no encontrado. Por favor, inicia sesión de nuevo.', 'error')
        logout_user()
        return redirect(url_for('main.login'))

    total_compras = mongo.db.pedidos.count_documents({'user_uid': user_uid})
    return render_template('perfil.html', user=user_data, total_compras=total_compras)

@user_bp.route('/api/perfil/update', methods=['PUT'])
@login_required
def update_perfil():
    user_uid = int(current_user.get_id())
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No se recibieron datos.'}), 400

    update_fields = {}
    allowed_fields = ['nombre', 'email', 'phone', 'direccion']
    
    for field in allowed_fields:
        if field in data:
            value = data[field].strip()
            # Verificar unicidad para email y phone
            if field in ['email', 'phone'] and value:
                existing = mongo.db.usuarios.find_one({field: value, 'uid': {'$ne': user_uid}})
                if existing:
                    return jsonify({'success': False, 'message': f'El {field} ya está en uso por otro usuario.'}), 409
            update_fields[field] = value if value else None

    if not update_fields:
        return jsonify({'success': False, 'message': 'No hay campos válidos para actualizar.'}), 400
    # CORRECCIÓN: Usar el nombre de colección correcto 'usuarios'
    result = mongo.db.usuarios.update_one({'uid': user_uid}, {'$set': update_fields})

    if result.matched_count == 0:
        return jsonify({'success': False, 'message': 'Usuario no encontrado.'}), 404
    
    return jsonify({'success': True, 'message': 'Información personal actualizada exitosamente.'})

@user_bp.route('/api/perfil/change_password', methods=['POST'])
@login_required
def change_password():
    user_uid = int(current_user.get_id())
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    # CORRECCIÓN: Usar el nombre de colección correcto 'usuarios'
    user = mongo.db.usuarios.find_one({'uid': user_uid})
    if not user or not check_password_hash(user['password'], current_password):
        return jsonify({'success': False, 'message': 'La contraseña actual es incorrecta.'}), 403
    
    hashed_password = generate_password_hash(new_password)
    mongo.db.usuarios.update_one({'uid': user_uid}, {'$set': {'password': hashed_password}})
    return jsonify({'success': True, 'message': 'Contraseña actualizada exitosamente.'})