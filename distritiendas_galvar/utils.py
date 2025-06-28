from flask import render_template
from pymongo import ReturnDocument
from . import mongo, mail
from flask_mail import Message

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

def send_order_emails(order, app_instance):
    """
    Envía correos de confirmación al cliente y de notificación al administrador.
    Necesita la instancia de la app para el contexto.
    """
    if not app_instance.config.get('MAIL_USERNAME') or not app_instance.config.get('ADMIN_EMAIL'):
        app_instance.logger.warning("Credenciales de correo no configuradas. No se enviarán emails.")
        return

    try:
        with app_instance.app_context():
            # Email para el cliente
            customer_email = order['shipping_info']['email']
            msg_customer = Message(
                subject=f"Confirmación de tu pedido #{order['order_uid']}",
                recipients=[customer_email]
            )
            msg_customer.html = render_template('emails/order_confirmation_email.html', order=order)
            mail.send(msg_customer)

            # Email para el administrador (si está configurado)
            if app_instance.config['ADMIN_EMAIL']:
                msg_admin = Message(subject=f"¡Nuevo Pedido! #{order['order_uid']}", recipients=[app_instance.config['ADMIN_EMAIL']])
                msg_admin.html = render_template('emails/new_order_notification_email.html', order=order)
                mail.send(msg_admin)
    except Exception as e:
        app_instance.logger.error(f"Error al enviar correos para el pedido {order.get('order_uid', 'N/A')}: {e}")