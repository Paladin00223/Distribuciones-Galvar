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
import sqlite3, os, datetime

#Creamo la aplicación con Flask
app = Flask(__name__)
app.secret_key = 'tu_clave_secreta_super_dificil_de_adivinar' # ¡IMPORTANTE! Cambia esto

#Habilitamos CORS en nuestra API
CORS(app)

# --- Conexión a MongoDB (para productos y categorías) ---

#Conectamos la cadena de conexión a la BD
MONGO_URI = "mongodb+srv://jdvargas223:JDvargas223#@cluster0.u94fmoq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# COnectamos con la BD mongo mediante la
mongo = MongoClient(MONGO_URI)
# Seleccionamos la base de datos
base_datos = mongo.distribuciones_galvar
# Seleccionamos la colección
coleccion_categorias = base_datos.categorias
coleccion_productos = base_datos.productos

# --- Configuración y Conexión a SQLite (para usuarios) ---

DB_PATH = os.path.join(app.instance_path, 'usuarios.db')

# --- Conexión a SQLite (para usuarios) ---
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

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

@app.route ("/productos", methods=["GET"])
def productos():
    #Consultamos las categorias en la coleccion
    productos = list(coleccion_productos.find()) #find: listar todos
    #Convertimos los ids a cadena de caracteres
    for item in productos:
        item["_id"] = str(item["_id"])

    # Enviamos la lista de videos al archivo html
    return render_template("productos.html", productos=productos)

@app.route("/categoria/<id_categoria>/productos")
def productos_por_categoria(id_categoria):
    # Buscamos los productos que pertenecen a la categoría especificada.
    # Asumo que cada producto en tu base de datos tiene un campo 'categoria_id'.
    try:
        # Filtramos los productos por el ObjectId de la categoría
        productos_filtrados = list(coleccion_productos.find({'categoria_id': ObjectId(id_categoria)}))
    except InvalidId:
        return "ID de categoría inválido", 400

    # Convertimos los _id a cadena para que no den problemas en la plantilla
    for item in productos_filtrados:
        item["_id"] = str(item["_id"])
        if 'categoria_id' in item and isinstance(item['categoria_id'], ObjectId):
            item['categoria_id'] = str(item['categoria_id'])

    # Reutilizamos la plantilla 'productos.html' para mostrar los productos filtrados
    # y le pasamos la lista de productos que encontramos.
    return render_template("productos.html", productos=productos_filtrados)

@app.route("/producto/<id>", methods=["GET"])
def producto(id):
    # Buscamos el producto específico por su ID
    producto = coleccion_productos.find_one({'_id': ObjectId(id)})

    # Si el producto no se encuentra, podrías mostrar una página de error 404
    if not producto:
        return "Producto no encontrado", 404

    # Convertimos el _id a una cadena para evitar problemas en la plantilla
    producto["_id"] = str(producto["_id"])

    # Renderizamos una nueva plantilla para mostrar los detalles del producto
    return render_template("producto.html", producto=producto)

# --- Rutas de Autenticación y Usuarios (SQLite) ---

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'status': 'error', 'message': 'Email y contraseña son requeridos'}), 400

    hashed_password = generate_password_hash(password)

    conn = get_db_connection()
    try:
        conn.execute(
            'INSERT INTO usuarios (nombre, email, password, cedula, tipo) VALUES (?, ?, ?, ?, ?)',
            (data.get('nombre'), email, hashed_password, data.get('cedula'), data.get('tipo', 'usuario'))
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'status': 'error', 'message': 'El email ya está registrado'}), 409
    finally:
        conn.close()

    return jsonify({'status': 'ok', 'message': 'Usuario registrado exitosamente'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'status': 'error', 'message': 'Email y contraseña son requeridos'}), 400

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM usuarios WHERE email = ?', (email,)).fetchone()

    if user and check_password_hash(user['password'], password):
        # Contraseña correcta, actualizamos último acceso y creamos la sesión
        conn.execute(
            'UPDATE usuarios SET ultimo_acceso = ? WHERE id = ?',
            (datetime.datetime.now(), user['id'])
        )
        conn.commit()
        conn.close()

        session['user_id'] = user['id']
        session['user_email'] = user['email']
        session['user_type'] = user['tipo']
        return jsonify({'status': 'ok', 'message': 'Inicio de sesión exitoso'})
    else:
        # Usuario no encontrado o contraseña incorrecta
        conn.close()
        return jsonify({'status': 'error', 'message': 'Credenciales inválidas'}), 401

@app.route('/logout')
def logout():
    session.clear() # Elimina todos los datos de la sesión
    return redirect(url_for('principal')) # Redirige a la página principal


# --- Rutas para usuarios (SQLite) ---

@app.route('/usuarios', methods=['GET'])
def get_usuarios():
    conn = get_db_connection()
    usuarios = conn.execute('SELECT * FROM usuarios').fetchall()
    conn.close()
    return jsonify([dict(u) for u in usuarios])

@app.route('/usuarios/<int:usuario_id>', methods=['PUT'])
def update_usuario(usuario_id):
    data = request.json
    conn = get_db_connection()
    # Solo actualiza los campos enviados
    campos = []
    valores = []
    for campo in ['cedula', 'documento', 'paquete', 'estado']:
        if campo in data:
            campos.append(f"{campo}=?")
            valores.append(data[campo])
    if not campos:
        conn.close()
        return jsonify({'status': 'no fields'}), 400
    valores.append(usuario_id)
    conn.execute(f'UPDATE usuarios SET {", ".join(campos)} WHERE id=?', valores)
    conn.commit()
    conn.close()
    return jsonify({'status': 'ok'})

# Ejecuta la aplicación principal
if __name__ == "__main__":
    # Asegurarse de que la carpeta 'instance' exista
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass # La carpeta ya existe
    # Crea la tabla de usuarios si no existe (para SQLite)
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            cedula TEXT,
            documento TEXT,
            paquete TEXT,
            puntos INTEGER NOT NULL DEFAULT 0,
            estado TEXT NOT NULL DEFAULT 'activo',
            tipo TEXT NOT NULL DEFAULT 'usuario', -- puede ser 'usuario' o 'admin'
            ultimo_acceso DATETIME,
            fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.close()

    # --- Crear usuario administrador inicial si no existe ---
    conn = get_db_connection()
    admin_email = 'jdvargas223@gmail.com'
    admin_user = conn.execute("SELECT id FROM usuarios WHERE email = ?", (admin_email,)).fetchone()
    if admin_user is None:
        print(f"Creando usuario administrador inicial: {admin_email}")
        # ¡IMPORTANTE! Considera obtener esta contraseña de una variable de entorno en producción
        admin_password = 'JDv@rgA$223#'
        hashed_password = generate_password_hash(admin_password)
        conn.execute(
            "INSERT INTO usuarios (nombre, email, password, tipo, estado) VALUES (?, ?, ?, ?, ?)",
            ('Administrador', admin_email, hashed_password, 'admin', 'activo')
        )
        conn.commit()
    conn.close()

    app.run(debug=True, port=5000)
    
# Ejecuta este código en mcd
# pip install flask pymongo flask_cors