from flask import Flask, render_template, jsonify, request, session, redirect, url_for, flash
# Importamos la librería pymongo para con
from pymongo import MongoClient
# Importamos ObjectId para poder buscar por _id en MongoDB
from bson.objectid import ObjectId
# Importamos errors
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

# --- Rutas para la tienda (MongoDB) ---

# Definimos las rutas de la aplicación para la tienda
@app.route("/", methods=["GET"])
def principal():
    #Consultamos las categorias en la coleccion
    categorias = list(coleccion_categorias.find()) #find: listar todos
    #Convertimos los ids a cadena de caracteres
    for item in categorias:
        item["_id"] = str(item["_id"])

    # También consultamos los productos para que estén disponibles en la página principal
    productos = list(coleccion_productos.find())
    # Convertimos los ids a cadena de caracteres
    for item in productos:
        item["_id"] = str(item["_id"])

    # Enviamos la lista de videos al archivo html
    return render_template("index.html", categorias=categorias, productos=productos)

@app.route("/productos/<categoria>", methods=["GET"])
def productos(categoria):
    # Buscamos el producto específico por su ID
    productos = list(coleccion_productos.find({'categoria': categoria}))
    
    # Convertimos los ids a cadena de caracteres
    for item in productos:
        item["_id"] = str(item["_id"])
        print(item["nombre"])

    # Renderizamos una nueva plantilla para mostrar los detalles del producto
    return render_template("productos.html", productos=productos)

# --- Rutas de Autenticación y Usuarios (SQLite) ---

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'status': 'error', 'message': 'Email y contraseña son requeridos'}), 400

    # Verificar si el email ya existe en MongoDB
    if coleccion_usuarios.find_one({'email': email}):
        return jsonify({'status': 'error', 'message': 'El email ya está registrado'}), 409

    hashed_password = generate_password_hash(password)

    nuevo_usuario = {
        'nombre': data.get('nombre'),
        'email': email,
        'password': hashed_password,
        'cedula': data.get('cedula'),
        'documento': data.get('documento'),
        'paquete': data.get('paquete'),
        'puntos': 0,
        'estado': 'activo',
        'tipo': data.get('tipo', 'usuario'), # Puede ser 'usuario' o 'admin'
        'ultimo_acceso': datetime.datetime.now(),
        'fecha_creacion': datetime.datetime.now()
    }
    coleccion_usuarios.insert_one(nuevo_usuario)

    return jsonify({'status': 'ok', 'message': 'Usuario registrado exitosamente'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'status': 'error', 'message': 'Email y contraseña son requeridos.'}), 400

    user = coleccion_usuarios.find_one({'email': email})

    if user and check_password_hash(user['password'], password): # 'password' es el campo en MongoDB
        # Contraseña correcta, actualizamos último acceso y creamos la sesión
        coleccion_usuarios.update_one(
            {'_id': user['_id']},
            {'$set': {'ultimo_acceso': datetime.datetime.now()}}
        )

        session['user_id'] = str(user['_id']) # Guardar como string para compatibilidad
        session['user_email'] = user['email']
        session['user_type'] = user.get('tipo', 'usuario') # Usar .get para evitar KeyError si no existe

        return jsonify({'status': 'ok', 'message': 'Inicio de sesión exitoso'})
    else:
        # Usuario no encontrado o contraseña incorrecta
        return jsonify({'status': 'error', 'message': 'Credenciales inválidas'}), 401

@app.route('/logout')
def logout():
    session.clear() # Elimina todos los datos de la sesión
    return redirect(url_for('principal')) # Redirige a la página principal


# --- Rutas para usuarios (MongoDB) ---

@app.route('/usuarios', methods=['GET'])
def get_usuarios():
    usuarios = list(coleccion_usuarios.find())
    for user in usuarios:
        user['_id'] = str(user['_id']) # Convertir ObjectId a string
    return jsonify(usuarios)

@app.route('/usuarios/<usuario_id>', methods=['PUT'])
def update_usuario(usuario_id):
    data = request.json
    
    # Construir el diccionario de campos a actualizar
    update_fields = {}
    for field in ['nombre', 'email', 'cedula', 'documento', 'paquete', 'puntos', 'estado', 'tipo']:
        if field in data:
            update_fields[field] = data[field]
    
    # Si se envía una nueva contraseña, hashearla
    if 'password' in data and data['password']:
        update_fields['password'] = generate_password_hash(data['password'])

    if not update_fields:
        return jsonify({'status': 'error', 'message': 'No se proporcionaron campos para actualizar.'}), 400

    try:
        # Buscar y actualizar el usuario por su _id
        result = coleccion_usuarios.update_one(
            {'_id': ObjectId(usuario_id)},
            {'$set': update_fields}
        )

        if result.matched_count == 0:
            return jsonify({'status': 'error', 'message': 'Usuario no encontrado.'}), 404
        
        return jsonify({'status': 'ok', 'message': 'Usuario actualizado exitosamente.'})

    except InvalidId:
        return jsonify({'status': 'error', 'message': 'ID de usuario inválido.'}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error al actualizar usuario: {str(e)}'}), 500

# Ejecuta la aplicación principal
if __name__ == "__main__":
    # --- Crear usuario administrador inicial si no existe en MongoDB ---
    admin_email = 'jdvargas223@gmail.com'
    admin_user = coleccion_usuarios.find_one({'email': admin_email})
    if admin_user is None:
        print(f"Creando usuario administrador inicial: {admin_email}")
        # ¡IMPORTANTE! Considera obtener esta contraseña de una variable de entorno en producción
        admin_password = 'JDv@rgA$223#'
        hashed_password = generate_password_hash(admin_password)
        coleccion_usuarios.insert_one(
            {
                'nombre': 'Administrador',
                'email': admin_email,
                'password': hashed_password,
                'tipo': 'admin',
                'estado': 'activo',
                'puntos': 0, # Asegurarse de que los campos existan para evitar errores en otras partes
                'fecha_creacion': datetime.datetime.now(),
                'ultimo_acceso': datetime.datetime.now()
            }
        )
        print("Usuario administrador creado.")

    app.run(debug=True, port=5000)