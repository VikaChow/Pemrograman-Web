<?php
require_once 'db.php';
session_start();

// Set response content type
header('Content-Type: application/json');

// Cek login
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401); // Unauthorized
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

// Query pesanan
$query = "
    SELECT 
        o.id AS order_id,
        o.status,
        o.total_price,
        o.created_at,
        GROUP_CONCAT(p.name SEPARATOR ', ') AS products
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
";

$stmt = $conn->prepare($query);
if (!$stmt) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => 'SQL Error: ' . $conn->error]);
    exit;
}

$stmt->bind_param("i", $user_id);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Execution failed: ' . $stmt->error]);
    exit;
}

$result = $stmt->get_result();
if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Result error: ' . $stmt->error]);
    exit;
}

// Ambil data
$orders = [];
while ($row = $result->fetch_assoc()) {
    $orders[] = [
        'order_id'    => $row['order_id'],
        'status'      => $row['status'],
        'total_price' => (int)$row['total_price'],
        'created_at'  => $row['created_at'],
        'products'    => explode(', ', $row['products'])
    ];
}

echo json_encode(['success' => true, 'orders' => $orders]);