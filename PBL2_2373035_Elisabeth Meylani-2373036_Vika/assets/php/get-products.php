<?php
require_once 'db.php';
header('Content-Type: application/json');

$category = $_GET['category'] ?? '';
$subcategory = $_GET['subcategory'] ?? '';
$keyword = $_GET['keyword'] ?? '';

$products = [];

try {
    if (!empty($keyword)) {
        $stmt = $conn->prepare("SELECT id, name, image, price, created_at, stock FROM products WHERE is_deleted = 0 AND name LIKE ?");
        $searchParam = "%" . $keyword . "%";
        $stmt->bind_param("s", $searchParam);
    } elseif (!empty($category) && !empty($subcategory)) {
        $stmt = $conn->prepare("SELECT id, name, image, price, created_at, stock FROM products WHERE is_deleted = 0 AND category = ? AND subcategory = ?");
        $stmt->bind_param("ss", $category, $subcategory);
    } else {
        echo json_encode([]);
        exit;
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $products = $result->fetch_all(MYSQLI_ASSOC);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Terjadi kesalahan server']);
    exit;
}

echo json_encode($products);