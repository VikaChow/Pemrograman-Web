<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false]);
    exit;
}

include 'db.php';

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT name, email FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    echo json_encode(['success' => true, 'name' => $user['name'], 'email' => $user['email']]);
} else {
    echo json_encode(['success' => false]);
}

$conn->close();
?>