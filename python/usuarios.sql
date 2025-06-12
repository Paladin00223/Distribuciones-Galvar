CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    esAdmin INTEGER DEFAULT 0,
    puntos INTEGER DEFAULT 0,
    estado TEXT DEFAULT 'pendiente',
    cedula TEXT,
    ultimo_acceso DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuario administrador (contraseña en texto plano para pruebas)
INSERT INTO usuarios (nombre, email, password, esAdmin, puntos, estado)
VALUES ('Administrador', 'jdvargas223@gmail.com', 'JDv@rgA$223#', 1, 0, 'activo');

SELECT * FROM usuarios WHERE email = 'jdvargas223@gmail.com';