CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'usuario') NOT NULL,
    cedula VARCHAR(10) NULL,
    ultimo_acceso DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuario administrador
INSERT INTO usuarios (email, password, tipo) VALUES 
('jdvargas223@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'); 