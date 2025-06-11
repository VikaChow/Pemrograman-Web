<?php
require_once 'db.php';
header('Content-Type: application/json');

// Validasi input
if (!isset($_POST['order_id'], $_POST['status'])) {
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap.']);
    exit;
}

$order_id = intval($_POST['order_id']); // Pastikan integer
$status = strtolower(trim($_POST['status'])); // lowercase dan rapikan

// Validasi status yang diizinkan
$allowed_statuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
if (!in_array($status, $allowed_statuses)) {
    echo json_encode(['success' => false, 'message' => 'Status tidak valid.']);
    exit;
}

// Query update
$stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $order_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal update status.']);
}

$stmt->close();
$conn->close();