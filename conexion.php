<?php
$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "gcw";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Chequear conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
?>