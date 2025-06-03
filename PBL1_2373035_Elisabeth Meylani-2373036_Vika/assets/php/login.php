<?php
session_start();
include 'db.php';

function alertAndRedirect($message, $url) {
    echo "<script>
        alert('$message');
        window.location.href = '$url';
    </script>";
    exit();
}

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    alertAndRedirect("Email dan password wajib diisi.", "../../Login.html");
}

$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_role'] = $user['role'];

        if ($user['role'] === 'admin') {
            alertAndRedirect("Login berhasil sebagai Admin!", "../../Home-Admin.html");
        } else {
            alertAndRedirect("Login berhasil!", "../../Home.html");
        }
    } else {
        alertAndRedirect("Password salah.", "../../Login.html");
    }
} else {
    alertAndRedirect("Akun tidak ditemukan.", "../../Login.html");
}

$conn->close();
?>