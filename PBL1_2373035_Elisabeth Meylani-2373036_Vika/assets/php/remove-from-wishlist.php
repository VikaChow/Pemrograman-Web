<?php
session_start();
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$product_id = intval($data['product_id']);
$user_id = $_SESSION['user_id'] ?? 0;

if (!$user_id || !$product_id) {
  echo json_encode(['success' => false, 'message' => 'Data tidak valid.']);
  exit;
}

$stmt = $db->prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?");
$stmt->execute([$user_id, $product_id]);

echo json_encode(['success' => true, 'message' => 'Berhasil dihapus dari wishlist.']);