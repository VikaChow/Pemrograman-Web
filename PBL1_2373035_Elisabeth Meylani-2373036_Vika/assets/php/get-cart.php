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
  SELECT c.id, p.name, p.image, c.quantity 
  FROM cart c 
  JOIN products p ON c.product_id = p.id 
  WHERE c.user_id = ?
");

$query->bind_param("i", $userId);
$query->execute();

$result = $query->get_result();
$data = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($data);
?>