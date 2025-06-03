<?php
$email = $_POST['email'];
$password = $_POST['password'];

$newPasswordHashed = password_hash($password, PASSWORD_DEFAULT);

$dsn = "mysql:host=localhost;dbname=glowery;charset=utf8mb4";
$username = "root";
$password_db = "";

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
        echo "<script>
                alert('Password berhasil diubah. Silakan login.');
                window.location.href = '../../Login.html';
              </script>";
    } else {
        echo "<script>
                alert('Email tidak ditemukan atau password tidak berubah.');
                window.history.back();
              </script>";
    }
} catch (PDOException $e) {
    echo "<script>
            alert('Error: " . addslashes($e->getMessage()) . "');
            window.history.back();
          </script>";
}
?>