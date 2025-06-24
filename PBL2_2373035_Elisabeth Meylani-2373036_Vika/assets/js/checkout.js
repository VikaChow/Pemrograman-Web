document.addEventListener("DOMContentLoaded", async () => {
  const cartContainer = document.getElementById("checkout-cart-items");
  const totalDisplay = document.getElementById("checkout-total");
  const confirmBtn = document.getElementById("confirm-order");

  let cartItems = []; // untuk menyimpan item belanja
  let total = 0; // untuk total harga belanja

  try {
    // ambil data keranjang
    const res = await fetch("assets/php/get-cart.php");
    const data = await res.json();
    cartItems = data.data || [];

    if (cartItems.length === 0) {
      cartContainer.innerHTML = "<p style='text-align: center; color: #666;'>Keranjang kosong.</p>";
      totalDisplay.textContent = "Rp0";
      confirmBtn.disabled = true;
      return;
    }

    cartContainer.innerHTML = "";
    // untuk menampilkan setiap item di keranjang
    cartItems.forEach(item => {
      const imageSrc = item.image ? `assets/images/products/${item.image}` : 'assets/images/default-product.jpg';
      const itemElem = document.createElement("div");
      itemElem.className = "checkout-item";
      itemElem.innerHTML = `
        <div class="checkout-item-image">
          <img src="${imageSrc}" alt="${item.name}" width="80">
        </div>
        <div class="checkout-item-info">
          <p><strong>${item.quantity}</strong> x ${item.name}</p>
          <p>Rp${(item.price * item.quantity).toLocaleString("id-ID")}</p>
        </div>
      `;

      total += item.price * item.quantity;
      cartContainer.appendChild(itemElem);
    });

    totalDisplay.textContent = `Rp${total.toLocaleString("id-ID")}`;
  } catch (err) {
    console.error("Gagal memuat keranjang:", err);
    cartContainer.innerHTML = "<p style='text-align: center; color: red;'>Gagal memuat keranjang.</p>";
    totalDisplay.textContent = "Rp0";
    confirmBtn.disabled = true;
  }

  confirmBtn.addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const city = document.getElementById("city").value.trim();
    const postal = document.getElementById("postal_code").value.trim();
    const payment = document.getElementById("payment").value;

    if (!name || !address || !phone || !city || !postal || !payment) {
      Swal.fire({
        icon: 'warning',
        title: 'Lengkapi Formulir!',
        text: 'Harap lengkapi semua kolom pengiriman dan pembayaran.'
      });
      return;
    }

    if (cartItems.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Keranjang Kosong',
        text: 'Silakan tambahkan produk sebelum checkout.'
      });
      return;
    }

    const formData = new FormData();
    formData.append("recipient_name", name);
    formData.append("address", address);
    formData.append("phone", phone);
    formData.append("city", city);
    formData.append("postal_code", postal);
    formData.append("payment", payment);
    formData.append("total_price", total);
    formData.append("cart_items", JSON.stringify(cartItems));

    try {
      const res = await fetch("assets/php/checkout.php", {
        method: "POST",
        body: formData
      });

      const result = await res.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Pesanan Berhasil!",
          html: `
            <p>${result.message}</p>
            <p><strong>ID Pesanan:</strong> ${result.order_id}</p>
            <p><strong>Instruksi Pembayaran:</strong><br><span style="color:#3085d6">${result.payment_info}</span></p>
          `,
          confirmButtonText: "Kembali ke Home"
        }).then(() => {
          window.location.href = "Home.html";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Checkout",
          text: result.error || "Terjadi kesalahan saat memproses pesanan."
        });
      }
    } catch (error) {
      console.error("Checkout gagal:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menghubungi server."
      });
    }
  });
});