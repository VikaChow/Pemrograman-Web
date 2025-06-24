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

$stmt = $conn->prepare("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?");
$stmt->bind_param("ii", $user_id, $product_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Produk sudah ada di wishlist.']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO wishlist (user_id, product_id, added_at) VALUES (?, ?, NOW())");
$stmt->bind_param("ii", $user_id, $product_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Berhasil ditambahkan ke wishlist.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal menambahkan ke wishlist.']);
}
$conn->close();