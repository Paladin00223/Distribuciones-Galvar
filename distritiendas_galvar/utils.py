import threading
from flask import render_template, current_app
from pymongo import ReturnDocument
from . import mongo, mail
from flask_mail import Message

def send_async_email(app, msg):
    with app.app_context():
        mail.send(msg)

def get_next_sequence_value(sequence_name):
    """
    Obtiene el siguiente valor de una secuencia en la colección 'counters'.
    Crea el contador si no existe.
    """
    sequence_document = mongo.db.counters.find_one_and_update(
        {'_id': sequence_name},
        {'$inc': {'sequence_value': 1}},
        return_document=ReturnDocument.AFTER,
        upsert=True
    )
    return sequence_document['sequence_value']

def send_order_emails(order):
    """
    Envía correos de confirmación de forma asíncrona para no bloquear la respuesta al usuario.
    """
    if not current_app.config.get('MAIL_USERNAME') or not current_app.config.get('ADMIN_EMAIL'):
        current_app.logger.warning("Credenciales de correo no configuradas. No se enviarán emails.")
        return

    # Obtenemos la instancia real de la aplicación para pasarla al hilo
    app = current_app._get_current_object()

    try:
        # Email para el cliente
        customer_email = order['shipping_info']['email']
        msg_customer = Message(
            subject=f"Confirmación de tu pedido #{order['order_uid']}",
            recipients=[customer_email]
        )
        msg_customer.html = render_template('emails/order_confirmation_email.html', order=order)
        # Iniciar el envío en un hilo separado
        threading.Thread(target=send_async_email, args=(app, msg_customer)).start()

        # Email para el administrador (si está configurado)
        if current_app.config['ADMIN_EMAIL']:
            msg_admin = Message(subject=f"¡Nuevo Pedido! #{order['order_uid']}", recipients=[current_app.config['ADMIN_EMAIL']])
            msg_admin.html = render_template('emails/new_order_notification_email.html', order=order)
            # Iniciar el envío en un hilo separado
            threading.Thread(target=send_async_email, args=(app, msg_admin)).start()
    except Exception as e:
        current_app.logger.error(f"Error al enviar correos para el pedido {order.get('order_uid', 'N/A')}: {e}")