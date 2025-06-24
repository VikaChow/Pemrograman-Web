<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['count' => 0]);
    exit;
}

require 'db.php';

$userId = $_SESSION['user_id'];

$query = $conn->prepare("SELECT COUNT(*) as total FROM wishlist WHERE user_id = ?");
$query->bind_param("i", $userId);
$query->execute();
$result = $query->get_result();
$data = $result->fetch_assoc();

echo json_encode(['count' => (int)$data['total']]);
?>