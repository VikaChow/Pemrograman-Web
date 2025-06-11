<?php
require_once 'db.php';
header('Content-Type: application/json');

$sql = "
  SELECT 
    o.id AS order_id,
    sd.recipient_name,
    sd.address,
    o.total_price,
    o.status,
    o.created_at,
    p.name AS product_name,
    oi.quantity
  FROM orders o
  INNER JOIN shipping_details sd ON o.id = sd.order_id
  INNER JOIN order_items oi ON o.id = oi.order_id
  INNER JOIN products p ON oi.product_id = p.id
  ORDER BY o.created_at DESC
";

$result = $conn->query($sql);

$data = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $orderId = $row['order_id'];

        if (!isset($data[$orderId])) {
            $data[$orderId] = [
                'order_id' => $orderId,
                'recipient_name' => $row['recipient_name'],
                'address' => $row['address'],
                'total_price' => number_format($row['total_price'], 2, ',', '.'),
                'status' => ucfirst($row['status']),
                'created_at' => date('d-m-Y H:i', strtotime($row['created_at'])),
                'products' => []
            ];
        }

        $data[$orderId]['products'][] = $row['product_name'] . ' x' . $row['quantity'];
    }

    echo json_encode(['success' => true, 'data' => array_values($data)]);
} else {
    echo json_encode(['success' => false, 'message' => 'Tidak ada data pesanan.']);
}

$conn->close();