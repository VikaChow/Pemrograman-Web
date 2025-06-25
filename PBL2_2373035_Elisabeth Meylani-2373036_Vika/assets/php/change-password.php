<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    alertAndRedirect('Silakan login terlebih dahulu.', 'warning', '../../Login.html');
}

include 'db.php';

$user_id = $_SESSION['user_id'];
$current_password = $_POST['current_password'] ?? '';
$new_password = $_POST['new_password'] ?? '';
$confirm_new_password = $_POST['confirm_new_password'] ?? '';

function alertAndBack($msg, $icon = 'warning') {
    $msg_safe = json_encode($msg);
    $icon_safe = json_encode($icon);

    echo "
    <!DOCTYPE html>
    <html lang='id'>
    <head>
      <meta charset='UTF-8'>
      <title>Alert</title>
      <script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
    </head>
    <body>
      <script>
        Swal.fire({
          icon: $icon_safe,
          title: 'Oops!',
          text: $msg_safe,
          confirmButtonText: 'OK'
        }).then(() => {
          window.history.back();
        });
      </script>
    </body>
    </html>";
    exit;
}

function alertAndRedirect($msg, $icon, $redirect) {
    $msg_safe = json_encode($msg);
    $icon_safe = json_encode($icon);
    $redirect_safe = json_encode($redirect);

    echo "
    <!DOCTYPE html>
    <html lang='id'>
    <head>
      <meta charset='UTF-8'>
      <title>Redirect</title>
      <script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
    </head>
    <body>
      <script>
        Swal.fire({
          icon: $icon_safe,
          title: 'Info',
          text: $msg_safe,
          confirmButtonText: 'OK'
        }).then(() => {
          window.location.href = $redirect_safe;
        });
      </script>
    </body>
    </html>";
    exit;
}


// VALIDASI
if (empty($current_password) || empty($new_password) || empty($confirm_new_password)) {
    alertAndBack('Semua field harus diisi.');
}

if ($new_password !== $confirm_new_password) {
    alertAndBack('Konfirmasi kata sandi baru tidak sesuai.');
}


// CEK PASSWORD LAMA

$stmt = $conn->prepare("SELECT password_hash FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows !== 1) {
    alertAndBack('User tidak ditemukan.', 'error');
}

$user = $result->fetch_assoc();

if (!password_verify($current_password, $user['password_hash'])) {
    alertAndBack('Kata sandi lama salah.', 'error');
}


// UPDATE PASSWORD

$new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);

$update = $conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
$update->bind_param("si", $new_password_hash, $user_id);

if ($update->execute()) {
    session_destroy();
    alertAndRedirect('Password berhasil diubah. Silakan login ulang.', 'success', '../../Login.html');
} else {
    alertAndBack('Gagal mengubah password. Silakan coba lagi.', 'error');
}

$conn->close();
?>