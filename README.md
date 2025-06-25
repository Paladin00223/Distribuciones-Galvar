# CÓMO DESPLEGAR TU BACKEND DE PYTHON

1. Crea un archivo llamado <b>requirementes.txt</b> e incluye las librerías que requiera tu backend:

> ```
> flask
> flask-cors
> pymongo
> ```

2. Instala las librerías del archivo <b>requirements.txt</b> usando abriendo la terminal en la parte inferior de la pantalla y ejecutando el comando:

> ```
> pip3 install -r requirements.txt
> ```


3. Crea un archivo llamado <b>start.sh</b> y escribe el siguiente código para inicializar tu backend:

> ```
> python3 backend.py
> ```

4. Ahora puedes ver en la parte inferior de la pantalla el botón de <b>LOGS</b> para ver cómo python está ejecutando tu backend:
> ```
> WARNING: This is a development server.
> * Running on http://127.0.0.1:5000
> Press CTRL+C to quit
> * Restarting with stat
> ```

5. Para copiar la URL de tu backend y usarlo en tu aplicación web, utiliza el botón <b>SHARE</b> de la parte superior, te saldrá algo como esto:
> ```
> https://proyecto-ejemplo-backend.glitch.me
> ```