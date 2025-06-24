<?php
session_start();
require_once "db.php"; // pastikan koneksi database

$user_id = $_SESSION['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["data" => []]);
    exit;
}

$sql = "SELECT c.*, p.name, p.price, p.image 
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$cart_items = [];

while ($row = $result->fetch_assoc()) {
    $cart_items[] = [
        "product_id" => $row['product_id'],
        "name" => $row['name'],
        "price" => $row['price'],
        "quantity" => $row['quantity'],
        "image" => $row['image']
    ];
}

echo json_encode(["data" => $cart_items]);
?>