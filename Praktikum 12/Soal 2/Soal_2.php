<?php
$username = $_POST['username'];
$password = $_POST['password'];

if ($username == "admin" && $password == "admin") {
    echo "<h1>Login berhasil!</h1>";
    echo "<h2>Selamat datang, <span style='color: blue; font-weight: bold;'>$username</span>.</h2>";
    echo "<a href='http://localhost/Praktikum%2012/Soal%202/Soal_2.html' style='color: purple;'>kembali ke halaman login</a>";
} else {
    echo "<h2><span style='color: red;'>Username : <strong style='color: black'>$username</strong> Tidak Terdaftar!</span></h2>";
    echo "<a href='http://localhost/Praktikum%2012/Soal%202/Soal_2.html' style='color: darkmagenta;'>kembali ke halaman login</a>";
}
?>