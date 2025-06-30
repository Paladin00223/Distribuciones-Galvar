from dotenv import load_dotenv
from distritiendas_galvar import create_app

load_dotenv()  # Carga las variables de entorno desde el archivo .env

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)