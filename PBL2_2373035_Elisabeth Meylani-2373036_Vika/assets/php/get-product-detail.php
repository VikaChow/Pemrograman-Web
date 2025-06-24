<?php
require_once 'db.php';

$id = $_GET['id'] ?? '';

if ($id) {
  $stmt = $conn->prepare("SELECT id, name, image, description, price, stock FROM products WHERE id = ?");
  $stmt->bind_param("i", $id);
  $stmt->execute();
  $result = $stmt->get_result();
  $product = $result->fetch_assoc();

  if ($product) {
    echo json_encode($product);
  } else {
    echo json_encode(["error" => "Produk tidak ditemukan."]);
  }
} else {
  echo json_encode(["error" => "ID tidak ditemukan."]);
}