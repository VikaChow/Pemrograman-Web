<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    echo "<script>alert('Silakan login terlebih dahulu.'); window.location.href='../../Login.html';</script>";
    exit;
}

include 'db.php';

$user_id = $_SESSION['user_id'];
$current_password = $_POST['current_password'] ?? '';
$new_password = $_POST['new_password'] ?? '';
$confirm_new_password = $_POST['confirm_new_password'] ?? '';

function alertAndBack($msg) {
    echo "<script>alert('$msg'); window.history.back();</script>";
    exit;
}

if (empty($current_password) || empty($new_password) || empty($confirm_new_password)) {
    alertAndBack('Semua field harus diisi.');
}

if ($new_password !== $confirm_new_password) {
    alertAndBack('Konfirmasi kata sandi baru tidak sesuai.');
}

$stmt = $conn->prepare("SELECT password_hash FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows !== 1) {
    alertAndBack('User tidak ditemukan.');
}

$user = $result->fetch_assoc();

if (!password_verify($current_password, $user['password_hash'])) {
    alertAndBack('Kata sandi lama salah.');
}

$new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);

$update = $conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
$update->bind_param("si", $new_password_hash, $user_id);

if ($update->execute()) {
    echo "<script>alert('Password berhasil diubah. Silakan login ulang.'); window.location.href='../../Login.html';</script>";
    session_destroy();
    exit;
} else {
    alertAndBack('Gagal mengubah password. Silakan coba lagi.');
}

$conn->close();
?>