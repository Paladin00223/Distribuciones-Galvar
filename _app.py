
from flask import Flask, render_template,
# Importamos la librería pymongo para con
from pymongo import MongoClient
# Importamos flask_cors para poder enviar
from flask_cors import CORS #CORS: Inter

#Creamo la aplicación con Flask
app = Flask(__name__)

#Habilitamos CORS en nuestra API
CORS(app)
#Conectamos la cadena de conexión a la BD


from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
uri = "mongodb+srv://jdvargas223:JDvargas223#@cluster0.u94fmoq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

    
# Ejecuta este código en mcd
# python -m pip install "pymongo[srv]"==3.12