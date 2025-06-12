CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTOINCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'usuario') NOT NULL,
    cedula VARCHAR(20) NULL,
    ultimo_acceso DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuario administrador (la contraseña está hasheada con bcrypt)
INSERT INTO usuarios (email, password, tipo) VALUES 
('jdvargas223@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');