<?php
require_once 'db.php';

$category = $_GET['category'] ?? '';
$subcategory = $_GET['subcategory'] ?? '';

if ($category && $subcategory) {
    $stmt = $conn->prepare("SELECT id, name, image, price FROM products WHERE category = ? AND subcategory = ?");
    $stmt->bind_param("ss", $category, $subcategory);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    echo json_encode($products);
} else {
    echo json_encode([]);
}
?>