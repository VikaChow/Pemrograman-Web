<?php
include 'db.php';

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm-password'] ?? '';

function alertBack($message) {
    echo "<script>alert('$message'); window.history.back();</script>";
    exit();
}

if (!$name || !$email || !$password || !$confirm_password) {
    alertBack("Semua field harus diisi.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    alertBack("Format email tidak valid.");
}

if ($password !== $confirm_password) {
    alertBack("Konfirmasi password tidak sesuai.");
}

$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    alertBack("Email sudah digunakan.");
}

$password_hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $name, $email, $password_hash);

if ($stmt->execute()) {
    echo "<script>alert('Pendaftaran berhasil! Silakan login.'); window.location.href = '../../Login.html';</script>";
} else {
    alertBack("Gagal menyimpan data: " . $stmt->error);
}

$conn->close();