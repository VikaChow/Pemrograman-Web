<?php
session_start();
include 'db.php';

$action = $_GET['action'] ?? '';
header('Content-Type: application/json');

// GET all products
if ($action === "get") {
    $result = $conn->query("SELECT * FROM products ORDER BY id DESC");
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    exit;
}

// GET single product for edit
if ($action === "edit" && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_assoc());
    exit;
}

// SAVE (create or update product)
if ($action === "save") {
    $id          = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $name        = trim($_POST['name'] ?? '');
    $price       = floatval($_POST['price'] ?? 0);
    $stock       = intval($_POST['stock'] ?? 0);
    $category    = $_POST['category'] !== '' ? $_POST['category'] : null;
    $subcategory = $_POST['subcategory'] !== '' ? $_POST['subcategory'] : null;
    $expire_at   = $_POST['expire_at'] !== '' ? $_POST['expire_at'] : null;
    $description = $_POST['description'] ?? '';
    $image       = null;

    $targetDir = "../images/products/";

    // Upload gambar jika ada
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $imageName = time() . "_" . basename($_FILES['image']['name']);
        $targetFile = $targetDir . $imageName;

        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($_FILES['image']['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Format gambar tidak didukung.']);
            exit;
        }

        if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
            http_response_code(500);
            echo json_encode(['error' => 'Gagal mengunggah gambar.']);
            exit;
        }

        $image = $imageName;

        if ($id) {
            $stmt = $conn->prepare("SELECT image FROM products WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($row = $result->fetch_assoc()) {
                $oldImagePath = $targetDir . $row['image'];
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }
        }
    }

    // Ambil gambar lama jika tidak upload baru
    if ($id && !$image) {
        $stmt = $conn->prepare("SELECT image FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $image = $row['image'] ?? null;
    }

    // Format tanggal
    if ($expire_at) {
        $date = date_create($expire_at);
        $expire_at = $date ? date_format($date, 'Y-m-d') : null;
    }

    if ($id > 0) {
        // Update
        $stmt = $conn->prepare("UPDATE products SET name=?, price=?, stock=?, category=?, subcategory=?, expire_at=?, description=?, image=?, updated_at=NOW() WHERE id=?");
        $stmt->bind_param("sdisssssi", $name, $price, $stock, $category, $subcategory, $expire_at, $description, $image, $id);
    } else {
        // Insert
        $stmt = $conn->prepare("INSERT INTO products (name, price, stock, category, subcategory, expire_at, description, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        $stmt->bind_param("sdisssss", $name, $price, $stock, $category, $subcategory, $expire_at, $description, $image);
    }

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Query gagal: ' . $stmt->error]);
    }

    exit;
}

// DELETE product
if ($action === "delete" && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $targetDir = "../images/products/";

    $stmt = $conn->prepare("SELECT image FROM products WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $row = $result->fetch_assoc()) {
        $imagePath = $targetDir . $row['image'];
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }

        $deleteStmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $deleteStmt->bind_param("i", $id);
        $deleteStmt->execute();

        echo json_encode(["status" => "deleted"]);
    } else {
        echo json_encode(["error" => "Produk tidak ditemukan"]);
    }
    exit;
}

// Jika action tidak valid
http_response_code(400);
echo json_encode(['error' => 'Action tidak valid']);
exit;