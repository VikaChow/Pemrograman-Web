<?php
include 'db.php';

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm-password'] ?? '';

function swalAndRedirect($title, $message, $icon, $url = null) {
    echo "<!DOCTYPE html>
    <html lang='id'>
    <head>
        <meta charset='UTF-8'>
        <title>Informasi</title>
        <script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
    </head>
    <body>
    <script>
        Swal.fire({
            title: '$title',
            text: '$message',
            icon: '$icon'
        }).then(() => {
            " . ($url ? "window.location.href = '$url';" : "window.history.back();") . "
        });
    </script>
    </body>
    </html>";
    exit();
}

// Validasi
if (!$name || !$email || !$password || !$confirm_password) {
    swalAndRedirect("Gagal", "Semua field harus diisi.", "warning");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    swalAndRedirect("Gagal", "Format email tidak valid.", "warning");
}

if ($password !== $confirm_password) {
    swalAndRedirect("Gagal", "Konfirmasi password tidak sesuai.", "warning");
}

// Cek email
$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    swalAndRedirect("Gagal", "Email sudah digunakan.", "error");
}

// Simpan user
$password_hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $name, $email, $password_hash);

if ($stmt->execute()) {
    swalAndRedirect("Berhasil", "Pendaftaran berhasil! Silakan login.", "success", "../../Login.html");
} else {
    swalAndRedirect("Gagal", "Gagal menyimpan data: " . $stmt->error, "error");
}

$conn->close();
?>