<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Silakan login terlebih dahulu.']);
    exit;
}

include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$product_id = $data['product_id'] ?? null;
$user_id = $_SESSION['user_id'];

if (!$product_id) {
    echo json_encode(['success' => false, 'message' => 'ID produk tidak valid.']);
    exit;
}

$stmt = $conn->prepare("SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?");
$stmt->bind_param("ii", $user_id, $product_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $new_qty = $row['quantity'] + 1;
    $update = $conn->prepare("UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?");
    $update->bind_param("ii", $new_qty, $row['id']);
    $update->execute();
    echo json_encode(['success' => true, 'message' => 'Jumlah produk di keranjang ditambah.']);
} else {
    $insert = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity, added_at, updated_at) VALUES (?, ?, 1, NOW(), NOW())");
    $insert->bind_param("ii", $user_id, $product_id);
    if ($insert->execute()) {
        echo json_encode(['success' => true, 'message' => 'Produk ditambahkan ke keranjang.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Gagal menambahkan ke keranjang.']);
    }
}

$conn->close();