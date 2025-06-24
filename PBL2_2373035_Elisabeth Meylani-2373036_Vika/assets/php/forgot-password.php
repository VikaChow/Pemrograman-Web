<?php
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirmPassword = $_POST['confirm-password'] ?? '';

$dsn = "mysql:host=localhost;dbname=glowery;charset=utf8mb4";
$username = "root";
$password_db = "";

// Fungsi helper swal + redirect/back
function swalAndRedirect($title, $message, $icon, $url = null) {
    $title = htmlspecialchars($title, ENT_QUOTES);
    $message = htmlspecialchars($message, ENT_QUOTES);
    $icon = htmlspecialchars($icon, ENT_QUOTES);
    $redirectScript = $url ? "window.location.href = '$url';" : "window.history.back();";

    echo "<!DOCTYPE html>
    <html lang='id'>
    <head>
        <meta charset='UTF-8'>
        <title>Info</title>
        <script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
    </head>
    <body>
    <script>
        Swal.fire({
            title: '$title',
            text: '$message',
            icon: '$icon'
        }).then(() => {
            $redirectScript
        });
    </script>
    </body>
    </html>";
    exit();
}

// Validasi input
if (!$email || !$password || !$confirmPassword) {
    swalAndRedirect("Gagal", "Semua field harus diisi.", "warning");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    swalAndRedirect("Gagal", "Format email tidak valid.", "warning");
}

if ($password !== $confirmPassword) {
    swalAndRedirect("Gagal", "Konfirmasi password tidak sesuai.", "warning");
}

$newPasswordHashed = password_hash($password, PASSWORD_DEFAULT);

try {
    $pdo = new PDO($dsn, $username, $password_db, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $sql = "UPDATE users SET password_hash = :password WHERE email = :email";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':password' => $newPasswordHashed,
        ':email' => $email
    ]);

    if ($stmt->rowCount() > 0) {
        swalAndRedirect("Berhasil", "Password berhasil diubah. Silakan login.", "success", "../../Login.html");
    } else {
        swalAndRedirect("Info", "Email tidak ditemukan atau password sama dengan sebelumnya.", "info");
    }
} catch (PDOException $e) {
    $safeMessage = htmlspecialchars($e->getMessage(), ENT_QUOTES);
    swalAndRedirect("Error", "Terjadi kesalahan: $safeMessage", "error");
}
?>