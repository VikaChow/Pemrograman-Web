<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
  echo json_encode([]);
  exit;
}

require 'db.php';
$userId = $_SESSION['user_id'];

$query = $conn->prepare("
  SELECT w.product_id, p.name, p.image 
  FROM wishlist w 
  JOIN products p ON w.product_id = p.id 
  WHERE w.user_id = ?
");

$query->bind_param("i", $userId);
$query->execute();

$result = $query->get_result();
$data = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($data);
?>