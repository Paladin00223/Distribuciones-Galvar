from flask import Flask, render_template, jsonify
# Importamos la librería pymongo para con
from pymongo import MongoClient
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

    # Enviamos la lista de videos al archivo html
    return render_template("index.html", categorias=categorias)

@app.route ("/productos", methods=["GET"])
def productos():
    #Consultamos las categorias en la coleccion
    productos = list(coleccion_productos.find()) #find: listar todos
    #Convertimos los ids a cadena de caracteres
    for item in productos:
        item["_id"] = str(item["_id"])

    # Enviamos la lista de videos al archivo html
    return render_template("productos.html", productos=productos)




# Ejecuta la aplicación principal
if __name__ == "__main__":
    app.run(debug=True, port=5000)
    
# Ejecuta este código en mcd
# pip install flask pymongo flask_cors