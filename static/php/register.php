<?php
session_start();
include 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $usuario = $_POST['usuario'];
    $password = $_POST['password'];
    $tipo = $_POST['tipo'];
    $cedula = isset($_POST['cedula']) ? $_POST['cedula'] : null;
    
    // Verificar si el usuario ya existe
    $check_sql = "SELECT * FROM usuarios WHERE usuario = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("s", $usuario);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows > 0) {
        header("Location: ../html/register.html?error=1");
        exit();
    }
    
    // Validar cédula solo para usuarios normales
    if ($tipo === 'usuario' && (empty($cedula) || !preg_match("/^\d{8,10}$/", $cedula))) {
        header("Location: ../html/register.html?error=2");
        exit();
    }
    
    // Hash de la contraseña
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Insertar nuevo usuario
    $sql = "INSERT INTO usuarios (usuario, password, tipo, cedula) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $usuario, $hashed_password, $tipo, $cedula);
    
    if ($stmt->execute()) {
        header("Location: ../html/login.html?success=1");
    } else {
        header("Location: ../html/register.html?error=3");
    }
    
    $stmt->close();
    $conn->close();
}
?> 