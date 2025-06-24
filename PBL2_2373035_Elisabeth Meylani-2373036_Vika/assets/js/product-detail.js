document.addEventListener("DOMContentLoaded", async function () {
  // === ELEMENT REFERENCES ===
  const ids = {
    wishlistCount: document.getElementById("wishlist-count"),
    cartCount: document.getElementById("cart-count"),
    wishlistModal: document.getElementById("wishlist-modal"),
    cartModal: document.getElementById("cart-modal"),
    profileModal: document.getElementById("profile-modal"),
    wishlistBtn: document.getElementById("wishlist-btn"),
    cartBtn: document.getElementById("cart-btn"),
    profileBtn: document.getElementById("profile-btn"),
    wishlistClose: document.getElementById("wishlist-close"),
    cartClose: document.getElementById("cart-close"),
    profileClose: document.getElementById("profile-close"),
    logoutBtn: document.getElementById("logout-btn"),
    checkoutBtn: document.getElementById("checkout-btn"),
    orderBtn: document.getElementById("my-orders-btn"),
    orderCloseBtn: document.getElementById("user-orders-close"),
    userOrdersModal: document.getElementById("user-orders-modal"),
    userOrdersContainer: document.getElementById("user-orders-container"),
  };

  const param = new URLSearchParams(window.location.search);
  const productId = param.get("id");

  // === UTILITY ===
  const openModal = (modal) => (modal.style.display = "block");
  const closeModal = (modal) => (modal.style.display = "none");

  async function fetchJSON(url, options = {}) {
    try {
      const res = await fetch(url, options);
      return await res.json();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Terjadi kesalahan koneksi.", "error");
      return null;
    }
  }

  async function postJSON(url, data) {
    return fetchJSON(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  // === COUNTS ===
  async function updateWishlistCount() {
    const data = await fetchJSON("assets/php/count-wishlist.php");
    ids.wishlistCount.textContent = data?.count || 0;
  }

  async function updateCartCount() {
    const data = await fetchJSON("assets/php/count-cart.php");
    ids.cartCount.textContent = data?.count || 0;
  }

  // === DETAIL PRODUK ===
  async function loadProductDetail() {
    if (!productId) return;
    const data = await fetchJSON(`assets/php/get-product-detail.php?id=${productId}`);
    if (!data) {
      Swal.fire("Oops", "Produk tidak ditemukan.", "error");
      return;
    }

    document.getElementById("product-image").src = `assets/images/products/${data.image || "default-product.png"}`;
    document.getElementById("product-name").textContent = data.name;
    const formattedDesc = (data.description || "Deskripsi tidak tersedia.").replace(/\n/g, "<br>");
    document.getElementById("product-description").innerHTML = formattedDesc;
    document.getElementById("product-price").textContent = `Rp${parseInt(data.price).toLocaleString("id-ID")}`;
    
    // Tampilkan badge stok habis
    if (data.stock == 0) {
      document.getElementById("product-stock").innerHTML = `<span class="badge-out">STOK HABIS</span>`;
    } else {
      document.getElementById("product-stock").innerHTML = "";
    }

    // Simpan stock ke tombol cart
    const cartBtn = document.querySelector(".cart-btn");
    if (cartBtn) cartBtn.dataset.stock = data.stock;
  }

  // === MODALS ===
  async function loadWishlist() {
    const data = await fetchJSON("assets/php/get-wishlist.php");
    const container = document.getElementById("wishlist-items");
    container.innerHTML = data?.length
      ? data.map(item => `
        <div class="modal-item">
          <img src="assets/images/products/${item.image}" alt="${item.name}" />
          <span>${item.name}</span>
          <button class="remove-wishlist" data-id="${item.product_id}">❌</button>
        </div>`).join("")
      : "<p>Wishlist kosong.</p>";
    openModal(ids.wishlistModal);
  }

  async function loadCart() {
    const data = await fetchJSON("assets/php/get-cart.php");
    const container = document.getElementById("cart-items");
    container.innerHTML = data?.data?.length
      ? data.data.map(item => `
        <div class="modal-item">
          <img src="assets/images/products/${item.image}" alt="${item.name}" />
          <span>${item.quantity} x ${item.name}</span>
          <p>Rp${(item.price * item.quantity).toLocaleString("id-ID")}</p>
          <button class="remove-cart" data-id="${item.product_id}">❌</button>
        </div>`).join("")
      : "<p>Keranjang kosong.</p>";
    openModal(ids.cartModal);
  }

  async function loadProfile() {
    const data = await fetchJSON("assets/php/get-profile.php");
    if (data?.success) {
      document.getElementById("user-name").textContent = data.name;
      document.getElementById("user-email").textContent = data.email;
      openModal(ids.profileModal);
    } else {
      Swal.fire("Login Dulu", "Silakan login terlebih dahulu.", "info").then(() => {
        window.location.href = "Login.html";
      });
    }
  }

  async function loadOrders() {
    const data = await fetchJSON("assets/php/get-user-orders.php");
    const container = ids.userOrdersContainer;
    container.innerHTML = data?.orders?.length
      ? data.orders.map(order => `
        <div class="order-card">
          <h3>#ORD${order.order_id}</h3>
          <p><strong>Tanggal:</strong> ${order.created_at}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Total:</strong> Rp${order.total_price}</p>
          <p><strong>Produk:</strong> ${Array.isArray(order.products) ? order.products.join(", ") : order.products}</p>
          <hr/>
        </div>`).join("")
      : "<p>Kamu belum memiliki pesanan.</p>";
    ids.userOrdersModal.classList.remove("hidden");
  }

  // === EVENTS ===
  ids.wishlistBtn?.addEventListener("click", loadWishlist);
  ids.cartBtn?.addEventListener("click", loadCart);
  ids.profileBtn?.addEventListener("click", loadProfile);
  ids.logoutBtn?.addEventListener("click", async () => {
    await fetchJSON("assets/php/logout.php");
    window.location.href = "Login.html";
  });
  ids.checkoutBtn?.addEventListener("click", async () => {
    const data = await fetchJSON("assets/php/get-cart.php");
    if (!data?.data?.length) {
      Swal.fire("Keranjang Kosong", "Tambahkan produk dulu sebelum checkout.", "info");
    } else {
      window.location.href = "Checkout.html";
    }
  });
  ids.orderBtn?.addEventListener("click", loadOrders);
  ids.orderCloseBtn?.addEventListener("click", () => ids.userOrdersModal.classList.add("hidden"));

  ids.wishlistClose?.addEventListener("click", () => closeModal(ids.wishlistModal));
  ids.cartClose?.addEventListener("click", () => closeModal(ids.cartModal));
  ids.profileClose?.addEventListener("click", () => closeModal(ids.profileModal));

  // === DELEGATION FOR WISHLIST/CART BUTTONS ===
  document.addEventListener("click", async (e) => {
    const target = e.target;

    if (target.classList.contains("wishlist-btn")) {
      const res = await postJSON("assets/php/add-to-wishlist.php", { product_id: productId });
      Swal.fire("Info", res?.message || "Gagal menambahkan ke wishlist.", res?.success ? "success" : "error");
      updateWishlistCount();
    }

    if (target.classList.contains("cart-btn")) {
      const stock = parseInt(target.dataset.stock);
      if (stock === 0) {
        Swal.fire("Stok Habis", "Produk ini tidak tersedia.", "info");
        return;
      }
      const res = await postJSON("assets/php/add-to-cart.php", { product_id: productId });
      Swal.fire("Info", res?.message || "Gagal menambahkan ke keranjang.", res?.success ? "success" : "error");
      updateCartCount();
    }


    if (target.classList.contains("remove-wishlist")) {
      const id = target.dataset.id;
      const res = await postJSON("assets/php/remove-from-wishlist.php", { product_id: id });
      if (res?.success) {
        target.closest(".modal-item").remove();
        updateWishlistCount();
      } else {
        Swal.fire("Error", res?.message || "Gagal menghapus dari wishlist.", "error");
      }
    }

    if (target.classList.contains("remove-cart")) {
      const id = target.dataset.id;
      const res = await postJSON("assets/php/remove-from-cart.php", { product_id: id });
      if (res?.success) {
        target.closest(".modal-item").remove();
        updateCartCount();
      } else {
        Swal.fire("Error", res?.message || "Gagal menghapus dari keranjang.", "error");
      }
    }
  });

  window.addEventListener("click", (e) => {
    if (e.target === ids.wishlistModal) closeModal(ids.wishlistModal);
    if (e.target === ids.cartModal) closeModal(ids.cartModal);
    if (e.target === ids.profileModal) closeModal(ids.profileModal);
    if (e.target === ids.userOrdersModal) ids.userOrdersModal.classList.add("hidden");
  });

  // === SEARCH ===
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const searchForm = document.getElementById("search-form");

  searchButton?.addEventListener("click", () => {
    const keyword = searchInput.value.trim();
    if (keyword) {
      window.location.href = `Product.html?search=${encodeURIComponent(keyword)}`;
    } else {
      Swal.fire("Info", "Masukkan kata kunci.", "info");
    }
  });

  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = searchInput.value.trim();
    if (keyword) {
      window.location.href = `Product.html?search=${encodeURIComponent(keyword)}`;
    } else {
      Swal.fire("Info", "Masukkan kata kunci.", "info");
    }
  });

  // === INIT ===
  await updateWishlistCount();
  await updateCartCount();
  await loadProductDetail();
});