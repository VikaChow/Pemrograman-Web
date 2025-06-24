<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
  echo json_encode([
    "success" => false,
    "message" => "Unauthorized"
  ]);
  exit;
}

require 'db.php';

// Total produk
$total_produk = 0;
$res_produk = $conn->query("SELECT COUNT(*) AS total FROM products");
if ($res_produk && $row = $res_produk->fetch_assoc()) {
  $total_produk = $row['total'];
}

// Total pesanan
$total_pesanan = 0;
$res_pesanan = $conn->query("SELECT COUNT(*) AS total FROM orders");
if ($res_pesanan && $row = $res_pesanan->fetch_assoc()) {
  $total_pesanan = $row['total'];
}

// Pesanan pending
$pending_pesanan = 0;
$res_pending = $conn->query("SELECT COUNT(*) AS total FROM orders WHERE status = 'pending'");
if ($res_pending && $row = $res_pending->fetch_assoc()) {
  $pending_pesanan = $row['total'];
}

// Recent orders
$recent_orders = [];
$res_recent = $conn->query("
  SELECT o.id AS order_id, s.recipient_name, o.status 
  FROM orders o 
  JOIN payment_details s ON o.id = s.order_id 
  ORDER BY o.created_at DESC 
  LIMIT 5
");
if ($res_recent) {
  while ($row = $res_recent->fetch_assoc()) {
    $recent_orders[] = $row;
  }
}

// Output JSON
echo json_encode([
  "success" => true,
  "total_produk" => $total_produk,
  "total_pesanan" => $total_pesanan,
  "pending_pesanan" => $pending_pesanan,
  "recent_orders" => $recent_orders
]);
?>