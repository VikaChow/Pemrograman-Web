<?php
session_start();
include 'db.php';

$action = $_GET['action'] ?? '';

$targetDir = "../images/banner/";

if ($action === "get") {
    $result = $conn->query("SELECT * FROM banner ORDER BY id DESC");
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
}

elseif ($action === "save") {
    $id = $_POST['bannerId'] ?? '';
    $image = null;

    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $imageName = time() . "_" . basename($_FILES["image"]["name"]);
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
            $res = $conn->query("SELECT image FROM banner WHERE id = $id");
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
            $res = $conn->query("SELECT image FROM banner WHERE id = $id");
            $old = $res->fetch_assoc();
            $image = $old['image'] ?? null;
        }

        $stmt = $conn->prepare("UPDATE banner SET image=?, updated_at=NOW() WHERE id=?");
        $stmt->bind_param("si", $image, $id);
    } else {
        $stmt = $conn->prepare("INSERT INTO banner (image, created_at) VALUES (?, NOW())");
        $stmt->bind_param("s", $image);
    }

    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "Error: " . $stmt->error;
    }
}

elseif ($_GET['action'] == 'update' && isset($_GET['id'])) {
    $id = intval($_GET['id']);

    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $imageName = time() . "_" . basename($_FILES['image']['name']);
        $targetFile = $targetDir . $imageName;

        // Buat folder jika belum ada
        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        // Ambil gambar lama untuk dihapus
        $res = $conn->query("SELECT image FROM banner WHERE id = $id");
        if ($res && $res->num_rows > 0) {
            $old = $res->fetch_assoc();
            $oldImagePath = $targetDir . $old['image'];
            if ($old['image'] && file_exists($oldImagePath)) {
                unlink($oldImagePath);
            }
        }

        // Upload gambar baru
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
            $stmt = $conn->prepare("UPDATE banner SET image=?, updated_at=NOW() WHERE id=?");
            $stmt->bind_param("si", $imageName, $id);

            if ($stmt->execute()) {
                echo "updated";
            } else {
                echo "db_error: " . $stmt->error;
            }
        } else {
            echo "upload_failed";
        }
    } else {
        echo "no_file";
    }
}

elseif ($action === "delete" && isset($_GET['id'])) {
    $id = intval($_GET['id']);

    $res = $conn->query("SELECT image FROM banner WHERE id = $id");
    if ($res && $res->num_rows > 0) {
        $row = $res->fetch_assoc();
        $imageFile = $row['image'];
        $imagePath = $targetDir . $imageFile;

        if ($imageFile && file_exists($imagePath)) {
            unlink($imagePath);
        }

        $conn->query("DELETE FROM banner WHERE id = $id");
        echo "deleted";
    } else {
        echo "Error: Banner tidak ditemukan";
    }
}

else {
    http_response_code(400);
    echo json_encode(['error' => 'Action tidak valid']);
}