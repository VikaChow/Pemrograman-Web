<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nama = $_POST['nama'];
    $password = $_POST['password'];
    $confirm = $_POST['confirm_password'];
    $position = $_POST['position'];

    if (empty($nama)) {
        echo "Input Nama belum di isi!";
    } elseif (empty($password)) {
        echo "Input Password belum di isi!";
    } elseif (empty($confirm)) {
        echo "Input Confirm Password belum di isi!";
    } elseif ($password !== $confirm) {
        echo "Password dan Confirm Password belum sama!";
    } else {
        echo "<div style='background-color: #ddd; padding: 10px; font-weight: bold; width: 200px;'>
                Data yang Anda Masukkan!
            </div>";
        echo "<table cellpadding='5'>
                <tr>
                <td>Name</td>
                <td>:</td>
                <td>$nama</td>
                </tr>
                <tr>
                <td>Position</td>
                <td>:</td>
                <td>$position</td>
                </tr>
            </table>";
        echo "<br><a href='http://localhost/Praktikum%2012/Soal%201/Soal_1.html'>back</a>";
    }
}
?>