import sys
import getpass
import re
from distritiendas_galvar import create_app, mongo
from werkzeug.security import generate_password_hash

app = create_app()

def promote_user_to_admin(email):
    """
    Encuentra un usuario por su email y le asigna el rol de 'admin'.
    """
    with app.app_context():
        # MEJORA: Búsqueda insensible a mayúsculas/minúsculas y por múltiples campos
        id_regex = re.compile(f'^{re.escape(email)}$', re.IGNORECASE)
        # CORRECCIÓN: Usar el nombre de colección correcto 'usuarios'
        user = mongo.db.usuarios.find_one({
            "$or": [
                {'email': id_regex},
                {'nombre_unico': id_regex},
                {'nombre': id_regex}
            ]
        })
        if not user:
            print(f"Error: No se encontró ningún usuario con el email '{email}'.")
            return
        if user.get('tipo') == 'admin':
            print(f"Información: El usuario '{email}' ya es un administrador.")
            return
        result = mongo.db.usuarios.update_one({'_id': user['_id']}, {'$set': {'tipo': 'admin'}})
        if result.modified_count > 0:
            print(f"¡Éxito! El usuario '{email}' ha sido promovido a administrador.")
        else:
            print("Error: No se pudo actualizar el usuario.")

def reset_user_password(email):
    """
    Encuentra un usuario por su email y establece una nueva contraseña hasheada.
    Solicita la contraseña de forma segura para evitar problemas con caracteres especiales.
    """
    with app.app_context():
        # MEJORA: Búsqueda insensible a mayúsculas/minúsculas y por múltiples campos
        id_regex = re.compile(f'^{re.escape(email)}$', re.IGNORECASE)
        # CORRECCIÓN: Usar el nombre de colección correcto 'usuarios'
        user = mongo.db.usuarios.find_one({
            "$or": [
                {'email': id_regex},
                {'nombre_unico': id_regex},
                {'nombre': id_regex}
            ]
        })
        if not user:
            print(f"Error: No se encontró ningún usuario con el email '{email}'.")
            return
        
        print(f"Se va a cambiar la contraseña para el usuario: {user.get('nombre')} ({email})")
        new_password = getpass.getpass("Introduce la nueva contraseña: ")
        confirm_password = getpass.getpass("Confirma la nueva contraseña: ")

        if new_password != confirm_password:
            print("\nError: Las contraseñas no coinciden. Operación cancelada.")
            return

        if not new_password:
            print("\nError: La contraseña no puede estar vacía. Operación cancelada.")
            return

        hashed_password = generate_password_hash(new_password)
        result = mongo.db.usuarios.update_one({'_id': user['_id']}, {'$set': {'password': hashed_password}})
        if result.modified_count > 0:
            print(f"¡Éxito! La contraseña para '{email}' ha sido actualizada.")
        else:
            print("Error: No se pudo actualizar la contraseña del usuario.")

if __name__ == '__main__':
    commands = {
        'promote-admin': promote_user_to_admin,
        'reset-password': reset_user_password
    }

    if len(sys.argv) != 3:
        print("Uso: python manage.py <comando> <email_del_usuario>")
        print("\nComandos disponibles:")
        for cmd in commands:
            print(f"  - {cmd}")
        sys.exit(1)

    command_name = sys.argv[1]
    # MEJORA: Limpiar espacios en blanco del input
    user_email = sys.argv[2].strip()
    
    command_func = commands.get(command_name)
    if command_func:
        command_func(user_email)
    else:
        print(f"Comando desconocido: '{command_name}'")
        sys.exit(1)