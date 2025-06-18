<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
  echo json_encode(['success' => false, 'message' => 'User belum login.']);
  exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$product_id = isset($data['product_id']) ? intval($data['product_id']) : 0;

if ($product_id <= 0) {
  echo json_encode(['success' => false, 'message' => 'ID produk tidak valid.']);
  exit;
}

require 'db.php'; // sesuaikan path koneksi

$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?");
$stmt->bind_param("ii", $user_id, $product_id);
$success = $stmt->execute();

if ($success && $stmt->affected_rows > 0) {
  echo json_encode(['success' => true, 'message' => 'Berhasil dihapus dari wishlist.']);
} else {
  echo json_encode(['success' => false, 'message' => 'Produk tidak ditemukan di wishlist.']);
}