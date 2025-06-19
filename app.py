#Importamos la librería Flask
from flask import Flask, render_template

#Creamos la aplicación con Flask
app = Flask(__name__)

#Definimos las rutas de la aplicación
@app.route("/", methods=["GET"])
def principal ():

    # lógica de consulta a la Base de datos
    # Se almacena en una variable los datos de la BD
    # finalmente se envían al archivo html

    return render_template("index.html", cuenta="Juan David Vargas")

#Indicamos a python que esta es la aplicación principal
if __name__ == "__main__":
    app.run(debug=True, port=5000)