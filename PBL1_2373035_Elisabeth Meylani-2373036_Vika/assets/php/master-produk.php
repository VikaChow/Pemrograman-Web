<?php
session_start();
include 'db.php';

$action = $_GET['action'] ?? '';

if ($action === "get") {
    $result = $conn->query("SELECT * FROM products ORDER BY id DESC");
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
}
elseif ($action === "edit" && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $result = $conn->query("SELECT * FROM products WHERE id = $id");
    echo json_encode($result->fetch_assoc());
}
elseif ($action === "save") {
    $id = $_POST['productId'] ?? '';
    $name = $_POST['name'] ?? '';
    $price = floatval($_POST['price'] ?? 0);
    $stock = intval($_POST['stock'] ?? 0);
    $category = $_POST['category'] ?? '';
    $subcategory = $_POST['subcategory'] ?? '';
    $expire_at = $_POST['expire_at'] ?? '';
    $description = $_POST['description'] ?? '';

    $image = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $imageName = time() . "_" . basename($_FILES["image"]["name"]);
        $targetDir = "../images/products/";
        $targetFile = $targetDir . $imageName;

        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        if (!move_uploaded_file($_FILES["image"]["tmp_name"], $targetFile)) {
            echo "Error: Gagal mengunggah gambar.";
            exit;
        }
        $image = $imageName;

        if ($id) {
            $res = $conn->query("SELECT image FROM products WHERE id = $id");
            if ($res && $res->num_rows > 0) {
                $old = $res->fetch_assoc();
                $oldImage = $old['image'];
                $oldImagePath = $targetDir . $oldImage;
                if ($oldImage && file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }
        }
    }

    if ($id) {
        if (!$image) {
            $res = $conn->query("SELECT image FROM products WHERE id = $id");
            $old = $res->fetch_assoc();
            $image = $old['image'] ?? null;
        }

        $stmt = $conn->prepare("UPDATE products 
            SET name=?, price=?, stock=?, category=?, subcategory=?, expire_at=?, description=?, image=?, updated_at=NOW()
            WHERE id=?");
        $stmt->bind_param("sdisssssi", $name, $price, $stock, $category, $subcategory, $expire_at, $description, $image, $id);
    } else {
        $stmt = $conn->prepare("INSERT INTO products 
            (name, price, stock, category, subcategory, expire_at, description, image, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        $stmt->bind_param("sdisssss", $name, $price, $stock, $category, $subcategory, $expire_at, $description, $image);
    }

    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "Error: " . $stmt->error;
    }
}
elseif ($action === "delete" && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $targetDir = "../images/products/";

    $res = $conn->query("SELECT image FROM products WHERE id = $id");
    if ($res && $res->num_rows > 0) {
        $row = $res->fetch_assoc();
        $imageFile = $row['image'];
        $imagePath = $targetDir . $imageFile;

        if ($imageFile && file_exists($imagePath)) {
            unlink($imagePath);
        }

        $conn->query("DELETE FROM products WHERE id = $id");
        echo "deleted";
    } else {
        echo "Error: Produk tidak ditemukan";
    }
}
else {
    http_response_code(400);
    echo json_encode(['error' => 'Action tidak valid']);
}