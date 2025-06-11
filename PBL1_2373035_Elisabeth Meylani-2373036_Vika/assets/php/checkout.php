<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Anda belum login."]);
    exit;
}

require 'db.php';

$user_id         = $_SESSION['user_id'];
$total_price     = $_POST['total_price'] ?? null;
$recipient_name  = $_POST['recipient_name'] ?? null;
$phone           = $_POST['phone'] ?? null;
$address         = $_POST['address'] ?? null;
$city            = $_POST['city'] ?? null;
$postal_code     = $_POST['postal_code'] ?? null;
$shipping_method = $_POST['payment'] ?? null;  // payment method: transfer / cod / ewallet
$cart_items_json = $_POST['cart_items'] ?? null;

if (!$cart_items_json) {
    http_response_code(400);
    echo json_encode(["error" => "Data keranjang tidak ditemukan."]);
    exit;
}

$cart_items = json_decode($cart_items_json, true);

if (!is_array($cart_items) || count($cart_items) === 0) {
    http_response_code(400);
    echo json_encode(["error" => "Keranjang belanja kosong."]);
    exit;
}

$conn->begin_transaction();

try {
    // 1. Simpan order
    $stmt = $conn->prepare("INSERT INTO orders (user_id, total_price) VALUES (?, ?)");
    $stmt->bind_param("id", $user_id, $total_price);
    $stmt->execute();
    $order_id = $stmt->insert_id;
    $stmt->close();

    // 2. Simpan item-item pesanan dan kurangi stok
    $stmt_item = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    $stmt_update_stock = $conn->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

    foreach ($cart_items as $item) {
        $product_id = $item['product_id'];
        $quantity   = $item['quantity'];
        $price      = $item['price'];

        // Simpan order item
        $stmt_item->bind_param("iiid", $order_id, $product_id, $quantity, $price);
        $stmt_item->execute();

        // Kurangi stok produk
        $stmt_update_stock->bind_param("ii", $quantity, $product_id);
        $stmt_update_stock->execute();
    }
    $stmt_item->close();
    $stmt_update_stock->close();

    // 3. Simpan data pengiriman
    $stmt_shipping = $conn->prepare("
        INSERT INTO shipping_details 
        (order_id, recipient_name, phone, address, city, postal_code, shipping_method) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt_shipping->bind_param("issssss", $order_id, $recipient_name, $phone, $address, $city, $postal_code, $shipping_method);
    $stmt_shipping->execute();
    $stmt_shipping->close();

    // 4. Hapus keranjang user
    $stmt_clear_cart = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
    $stmt_clear_cart->bind_param("i", $user_id);
    $stmt_clear_cart->execute();
    $stmt_clear_cart->close();

    // 5. Buat kode pembayaran sesuai metode
    $payment_code = "";

    switch ($shipping_method) {
        case "transfer":
            $payment_code = "BANK BCA 1234567890 a.n. PT Growely Cantik";
            break;
        case "cod":
            $payment_code = "Bayar langsung di tempat";
            break;
        case "ewallet":
            $va_number = "8808" . str_pad($order_id, 6, "0", STR_PAD_LEFT);
            $payment_code = "Virtual Account: " . $va_number . " (OVO/DANA/LinkAja)";
            break;
        default:
            $payment_code = "Metode tidak dikenali.";
    }

    // Commit semua
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "✅ Pesanan berhasil dibuat!",
        "order_id" => $order_id,
        "payment_info" => $payment_code
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["error" => "❌ Gagal checkout: " . $e->getMessage()]);
}
?>