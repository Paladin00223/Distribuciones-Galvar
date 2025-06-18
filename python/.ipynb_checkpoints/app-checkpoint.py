from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # Permite peticiones desde tu frontend

def get_db_connection():
    conn = sqlite3.connect('usuarios.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/usuarios', methods=['GET'])
def get_usuarios():
    conn = get_db_connection()
    usuarios = conn.execute('SELECT * FROM usuarios').fetchall()
    conn.close()
    return jsonify([dict(u) for u in usuarios])

@app.route('/usuarios', methods=['POST'])
def add_usuario():
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO usuarios (nombre, email, cedula, documento, paquete, puntos, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
        (data['nombre'], data['email'], data['cedula'], data['documento'], data['paquete'], data['puntos'], data['estado'])
    )
    conn.commit()
    conn.close()
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    # Crea la tabla si no existe
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            email TEXT,
            cedula TEXT,
            documento TEXT,
            paquete TEXT,
            puntos INTEGER,
            estado TEXT
        )
    ''')
    conn.close()
    app.run(debug=True)

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