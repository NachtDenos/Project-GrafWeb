<?php
include 'conexion.php';

$username = $_POST['username'];
$password = $_POST['password']; // ¡Recuerda hash la contraseña!

$sql = "INSERT INTO jugadores (user, pass) VALUES ('$username', '$password')";

if ($conn->query($sql) === TRUE) {
    session_start();
    $_SESSION['username'] = $username;
    $_SESSION['user_id'] = $conn->insert_id; // El ID del usuario recién insertado
    header("Location: menu.php");
    echo "Usuario registrado exitosamente";
} else {
    echo "Error al registrar el usuario: " . $conn->error;
}

$conn->close();
?>
