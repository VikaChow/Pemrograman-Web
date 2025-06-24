<?php
session_start();
include 'db.php';

function swalAndRedirect($title, $message, $icon, $url) {
    echo "<!DOCTYPE html>
    <html lang='id'>
    <head>
        <meta charset='UTF-8'>
        <title>Redirect...</title>
        <script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
    </head>
    <body>
    <script>
        Swal.fire({
            title: '$title',
            text: '$message',
            icon: '$icon'
        }).then(() => {
            window.location.href = '$url';
        });
    </script>
    </body>
    </html>";
    exit();
}

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    swalAndRedirect("Gagal", "Email dan password wajib diisi.", "warning", "../../Login.html");
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
            swalAndRedirect("Berhasil", "Login berhasil sebagai Admin!", "success", "../../Home-Admin.html");
        } else {
            swalAndRedirect("Berhasil", "Login berhasil!", "success", "../../Home.html");
        }
    } else {
        swalAndRedirect("Gagal", "Password salah.", "error", "../../Login.html");
    }
} else {
    swalAndRedirect("Gagal", "Akun tidak ditemukan.", "error", "../../Login.html");
}

$conn->close();
?>