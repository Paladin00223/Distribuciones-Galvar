from flask import Flask, render_template, jsonify
# Importamos la librería pymongo para con
from pymongo import MongoClient
# Importamos ObjectId para poder buscar por _id en MongoDB
from bson.objectid import ObjectId
# Importamos errors
from bson.errors import InvalidId
# Importamos flask_cors para poder enviar
from flask_cors import CORS #CORS: Inter

#Creamo la aplicación con Flask
app = Flask(__name__)

#Habilitamos CORS en nuestra API
CORS(app)

#Conectamos la cadena de conexión a la BD
MONGO_URI = "mongodb+srv://jdvargas223:JDvargas223#@cluster0.u94fmoq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# COnectamos con la BD mongo mediante la
mongo = MongoClient(MONGO_URI)
# Seleccionamos la base de datos
base_datos = mongo.distribuciones_galvar
# Seleccionamos la colección
coleccion_categorias = base_datos.categorias
coleccion_productos = base_datos.productos

# Definimos las rutas de la aplicación
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

# Ejecuta la aplicación principal
if __name__ == "__main__":
    app.run(debug=True, port=5000)
    
# Ejecuta este código en mcd
# pip install flask pymongo flask_cors