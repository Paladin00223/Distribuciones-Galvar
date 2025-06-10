<?php
session_start();
include 'conexion.php';

// Función para eliminar cuentas inactivas
function eliminarCuentasInactivas($conn) {
    $sql = "DELETE FROM usuarios WHERE ultimo_acceso < DATE_SUB(NOW(), INTERVAL 1 YEAR)";
    $conn->query($sql);
}

// Ejecutar limpieza de cuentas inactivas
eliminarCuentasInactivas($conn);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    $sql = "SELECT * FROM usuarios WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        if (password_verify($password, $row['password'])) {
            // Actualizar último acceso
            $update_sql = "UPDATE usuarios SET ultimo_acceso = NOW() WHERE email = ?";
            $update_stmt = $conn->prepare($update_sql);
            $update_stmt->bind_param("s", $email);
            $update_stmt->execute();
            
            $_SESSION['usuario'] = $email;
            $_SESSION['tipo'] = $row['tipo'];
            header("Location: ../html/index.html");
        } else {
            header("Location: ../html/login.html?error=1");
        }
    } else {
        header("Location: ../html/login.html?error=1");
    }
    
    $stmt->close();
    $conn->close();
}
?> 