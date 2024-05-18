<?php
session_start();
include 'conexion.php';

$username = $_POST['username'];
$password = $_POST['password']; // ¡Recuerda verificar la contraseña!

if (empty($username) || empty($password)) {
    die("Por favor, completa todos los campos.");
}

$sql = "SELECT * FROM jugadores WHERE user='$username' AND pass='$password'";

try {
    $result = $conn->query($sql);

    if ($result === false) {
        throw new Exception("Error en la consulta SQL: " . $conn->error);
    }

    if ($result->num_rows == 1) {
        // Usuario válido, iniciar sesión y redireccionar
        $_SESSION['username'] = $username;
        $_SESSION['user_id'] = $result->fetch_assoc()['id']; // Obtener el ID del usuario

        // Redireccionar a la página de bienvenida
        header("Location: menu.php");
        exit();
    } else {
        // Nombre de usuario o contraseña incorrectos, redireccionar de nuevo a la página de inicio de sesión
        header("Location: index.html?error=1");
        exit();
    }
} catch (Exception $e) {
    die("Se produjo un error: " . $e->getMessage());
}

$conn->close();
?>