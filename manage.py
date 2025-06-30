import sys
import getpass
import re
from distritiendas_galvar import create_app, mongo
from werkzeug.security import generate_password_hash

app = create_app()

def _find_user_by_identifier(identifier):
    """
    Función auxiliar para encontrar un usuario por email, nombre_unico o nombre.
    Realiza una búsqueda insensible a mayúsculas/minúsculas.
    Retorna el documento del usuario o None si no se encuentra.
    """
    id_regex = re.compile(f'^{re.escape(identifier)}$', re.IGNORECASE)
    return mongo.db.usuarios.find_one({
        "$or": [
            {'email': id_regex},
            {'nombre_unico': id_regex},
            {'nombre': id_regex}
        ]
    })

def promote_user_to_admin(identifier):
    """
    Encuentra un usuario por su identificador y le asigna el rol de 'admin'.
    """
    with app.app_context():
        user = _find_user_by_identifier(identifier)
        if not user:
            print(f"Error: No se encontró ningún usuario con el identificador '{identifier}'.")
            return
        if user.get('tipo') == 'admin':
            print(f"Información: El usuario '{identifier}' ya es un administrador.")
            return
        result = mongo.db.usuarios.update_one({'_id': user['_id']}, {'$set': {'tipo': 'admin'}})
        if result.modified_count > 0:
            print(f"¡Éxito! El usuario '{identifier}' ha sido promovido a administrador.")
        else:
            print("Error: No se pudo actualizar el usuario.")

def reset_user_password(identifier):
    """
    Encuentra un usuario por su identificador y establece una nueva contraseña hasheada.
    Solicita la contraseña de forma segura.
    """
    with app.app_context():
        user = _find_user_by_identifier(identifier)
        if not user:
            print(f"Error: No se encontró ningún usuario con el identificador '{identifier}'.")
            return
        
        print(f"Se va a cambiar la contraseña para el usuario: {user.get('nombre')} ({user.get('email')})")
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
            print(f"¡Éxito! La contraseña para '{identifier}' ha sido actualizada.")
        else:
            print("Error: No se pudo actualizar la contraseña del usuario.")

if __name__ == '__main__':
    commands = {
        'promote-admin': promote_user_to_admin,
        'reset-password': reset_user_password
    }

    if len(sys.argv) != 3:
        print("Uso: python manage.py <comando> <identificador_del_usuario>")
        print("\nComandos disponibles:")
        for cmd in commands:
            print(f"  - {cmd}")
        sys.exit(1)

    command_name = sys.argv[1]
    # MEJORA: Limpiar espacios en blanco del input
    user_identifier = sys.argv[2].strip()
    
    command_func = commands.get(command_name)
    if command_func:
        command_func(user_identifier)
    else:
        print(f"Comando desconocido: '{command_name}'")
        sys.exit(1)