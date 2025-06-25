document.addEventListener("DOMContentLoaded", async function () {
  const wishlistCountEl = document.getElementById("wishlist-count");
  const cartCountEl = document.getElementById("cart-count");
  const wishlistModal = document.getElementById("wishlist-modal");
  const cartModal = document.getElementById("cart-modal");
  const profileModal = document.getElementById("profile-modal");

  const wishlistBtn = document.getElementById("wishlist-btn");
  const cartBtn = document.getElementById("cart-btn");
  const profileBtn = document.getElementById("profile-btn");
  const wishlistClose = document.getElementById("wishlist-close");
  const cartClose = document.getElementById("cart-close");
  const profileClose = document.getElementById("profile-close");
  const logoutBtn = document.getElementById("logout-btn");
  const checkoutBtn = document.getElementById("checkout-btn");
  const orderBtn = document.getElementById("my-orders-btn");
  const orderCloseBtn = document.getElementById("user-orders-close");

  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const subcategory = params.get("subcategory");
  const keyword = params.get("search");

  function openModal(modal) {
    modal.style.display = "block";
  }
  function closeModal(modal) {
    modal.style.display = "none";
  }
  function truncateTextByCharacters(text, maxCharacters) {
    return text.length <= maxCharacters ? text : text.slice(0, maxCharacters) + "...";
  }

  async function fetchJSON(url, options = {}) {
    try {
      const res = await fetch(url, options);
      return await res.json();
    } catch (error) {
      console.error(error);
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

  async function updateWishlistCount() {
    const data = await fetchJSON("assets/php/count-wishlist.php");
    wishlistCountEl.textContent = data?.count || 0;
  }

  async function updateCartCount() {
    const data = await fetchJSON("assets/php/count-cart.php");
    cartCountEl.textContent = data?.count || 0;
  }

  async function loadWishlist() {
    const data = await fetchJSON("assets/php/get-wishlist.php");
    const container = document.getElementById("wishlist-items");
    container.innerHTML = "";  
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = "<p>Wishlist kosong.</p>";
    } else {
      data.forEach((item) => {
        const div = document.createElement("div");
        div.innerHTML = `
            <div class="modal-item">
              <img src="assets/images/products/${item.image}" alt="${item.name}" width="50">
              <span>${item.name}</span>
              <button class="remove-wishlist" data-id="${item.product_id}" aria-label="Hapus dari wishlist">❌</button>
            </div>`;
        container.appendChild(div);
      });
    }
    openModal(wishlistModal);
  }

  async function loadCart() {
    const data = await fetchJSON("assets/php/get-cart.php");
    const container = document.getElementById("cart-items");
    container.innerHTML = "";  
    if (!data?.data?.length) {
      container.innerHTML = "<p>Keranjang kosong.</p>";
    } else {
      data.data.forEach((item) => {
        const div = document.createElement("div");
        div.innerHTML = `
            <div class="modal-item">
              <img src="assets/images/products/${item.image}" alt="${item.name}" width="50">
              <span>${item.quantity} x ${item.name}</span>
              <p>Rp${(item.price * item.quantity).toLocaleString("id-ID")}</p>
              <button class="remove-cart" data-id="${item.product_id}" aria-label="Hapus dari keranjang">❌</button>
            </div>`;
        container.appendChild(div);
      });
    }
    openModal(cartModal);
  }

  async function loadProfile() {
    const data = await fetchJSON("assets/php/get-profile.php");
    if (data?.success) {
      document.getElementById("user-name").textContent = data.name;
      document.getElementById("user-email").textContent = data.email;
      openModal(profileModal);
    } else {
      Swal.fire("Login Dulu", "Silakan login terlebih dahulu.", "info").then(() => {
        window.location.href = "Login.html";
      });
    }
  }

  async function loadOrders() {
    const data = await fetchJSON("assets/php/get-user-orders.php");
    const container = document.getElementById("user-orders-container");
    container.innerHTML = "";  
    if (data?.success && Array.isArray(data.orders)) {
      if (data.orders.length === 0) {
        container.innerHTML = "<p>Kamu belum memiliki pesanan.</p>";
      } else {
        data.orders.forEach((order) => {
          const div = document.createElement("div");
          div.classList.add("order-card");
          div.innerHTML = `
            <h3>#ORD${order.order_id}</h3>
            <p><strong>Tanggal:</strong> ${order.created_at}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Total:</strong> Rp${order.total_price}</p>
            <p><strong>Produk:</strong> ${Array.isArray(order.products) ? order.products.join(", ") : order.products}</p>
            <hr/>
          `;
          container.appendChild(div);
        });
      }
      document.getElementById("user-orders-modal").classList.remove("hidden");
    } else {
      Swal.fire("Oops", "Gagal mengambil data pesanan.", "error");
    }
  }


  async function loadProducts(category, subcategory, keyword) {
  const titleEl = document.getElementById("product-title");
  const listEl = document.getElementById("product-list");
  
  let url = "assets/php/get-products.php?";
  if (keyword) {
    url += `keyword=${encodeURIComponent(keyword)}`;
    titleEl.textContent = `Hasil Pencarian: ${keyword}`;
  } else if (category && subcategory) {
    url += `category=${category}&subcategory=${subcategory}`;
    titleEl.textContent = `Produk ${subcategory || ""}`;
  } else {
    listEl.innerHTML = "<p>Tidak ada produk ditemukan.</p>";
    return;
  }

  listEl.innerHTML = "<p>Memuat produk...</p>";
  
  const data = await fetchJSON(url);
  if (!data?.length) {
    listEl.innerHTML = "<p>Tidak ada produk ditemukan.</p>";
    return;
  }

  // Tampilan produk
  listEl.innerHTML = "";  
    data.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-id", product.id);

    const isNew = ((new Date() - new Date(product.created_at)) / (1000 * 60 * 60)) < 24;
    const outOfStock = product.stock == 0;

    card.innerHTML = `
      ${isNew ? '<span class="badge">NEW</span>' : ""}
      ${outOfStock ? '<span class="badge badge-out">Stok Habis</span>' : ""}
      <img src="assets/images/products/${product.image || "default-product.png"}" alt="${product.name}">
      <h3>${truncateTextByCharacters(product.name, 23)}</h3>
      <p class="price">Rp${parseInt(product.price).toLocaleString("id-ID")}</p>
      <div class="action-buttons">
        <button class="wishlist-btn" data-id="${product.id}" aria-label="Tambah ke Wishlist">♡</button>
        <button class="cart-btn" data-id="${product.id}" data-stock="${product.stock}" aria-label="Tambah ke Keranjang">+</button>
      </div>
    `;
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("wishlist-btn") && !e.target.classList.contains("cart-btn")) {
        window.location.href = `Product-Detail.html?id=${product.id}`;
      }
    });
    listEl.appendChild(card);
  });
}


  wishlistBtn?.addEventListener("click", loadWishlist);
  cartBtn?.addEventListener("click", loadCart);
  profileBtn?.addEventListener("click", loadProfile);
  wishlistClose?.addEventListener("click", () => closeModal(wishlistModal));
  cartClose?.addEventListener("click", () => closeModal(cartModal));
  profileClose?.addEventListener("click", () => closeModal(profileModal));
  orderBtn?.addEventListener("click", loadOrders);
  orderCloseBtn?.addEventListener("click", () =>
    document.getElementById("user-orders-modal").classList.add("hidden")
  );
  logoutBtn?.addEventListener("click", async () => {
    await fetchJSON("assets/php/logout.php");
    window.location.href = "Login.html";
  });
  checkoutBtn?.addEventListener("click", async () => {
    const data = await fetchJSON("assets/php/get-cart.php");
    if (!data?.data?.length) {
      Swal.fire("Keranjang Kosong", "Tambahkan produk dulu sebelum checkout.", "info");
    } else {
      window.location.href = "Checkout.html";
    }
  });


  document.addEventListener("click", async e => {
    const target = e.target;

    if (target.classList.contains("wishlist-btn")) {
      const productId = target.getAttribute("data-id");
      try {
        const res = await fetch("assets/php/add-to-wishlist.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId })
        });
        const data = await res.json();
        if (data.success) {
          Swal.fire("Berhasil", data.message || "Produk berhasil ditambahkan ke wishlist.", "success");
        } else {
          Swal.fire("Gagal", data.message || "Gagal menambahkan produk ke wishlist.", "error");
        }
        updateWishlistCount();
      } catch {
        Swal.fire("Error", "Terjadi kesalahan saat menambahkan ke wishlist.", "error");
      }
    }

    if (target.classList.contains("cart-btn")) {
      const productId = target.getAttribute("data-id");
      const stock = parseInt(target.getAttribute("data-stock"));
      if (stock === 0) {
        Swal.fire("Stok Habis", "Produk ini tidak tersedia.", "info");
        return;
      }
      try {
        const res = await fetch("assets/php/add-to-cart.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId })
        });
        const data = await res.json();
        if (data.success) {
          Swal.fire("Berhasil", data.message || "Produk berhasil ditambahkan ke keranjang.", "success");
        } else {
          Swal.fire("Gagal", data.message || "Gagal menambahkan produk ke keranjang.", "error");
        }
        updateCartCount();
      } catch {
        Swal.fire("Error", "Terjadi kesalahan saat menambahkan ke keranjang.", "error");
      }
    }

    if (target.classList.contains("remove-wishlist")) {
      const productId = parseInt(target.getAttribute("data-id"));
      try {
        const res = await fetch("assets/php/remove-from-wishlist.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId })
        });
        const data = await res.json();
        if (data.success) {
          target.closest(".modal-item")?.remove();
          updateWishlistCount();
          const container = document.getElementById("wishlist-items");
          if (!container.children.length) {
            container.innerHTML = "<p>Wishlist kosong.</p>";
          }
        } else {
          Swal.fire("Gagal", data.message || "Gagal menghapus produk dari wishlist.", "error");
        }
      } catch {
        Swal.fire("Error", "Terjadi kesalahan saat menghapus dari wishlist.", "error");
      }
    }

    if (target.classList.contains("remove-cart")) {
      const productId = parseInt(target.getAttribute("data-id"));
      try {
        const res = await fetch("assets/php/remove-from-cart.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId })
        });
        const data = await res.json();
        if (data.success) {
          target.closest(".modal-item")?.remove();
          updateCartCount();
          const container = document.getElementById("cart-items");
          if (!container.children.length) {
            container.innerHTML = "<p>Keranjang kosong.</p>";
          }
        } else {
          Swal.fire("Gagal", data.message || "Gagal menghapus produk dari keranjang.", "error");
        }
      } catch {
        Swal.fire("Error", "Terjadi kesalahan saat menghapus dari keranjang.", "error");
      }
    }
  });

  // Awal Pake AI
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
  // Akhir Pake AI

  await updateWishlistCount();
  await updateCartCount();
  await loadProducts(category, subcategory, keyword);


  window.addEventListener("click", (e) => {
    if (e.target === wishlistModal) closeModal(wishlistModal);
    if (e.target === cartModal) closeModal(cartModal);
    if (e.target === profileModal) closeModal(profileModal);
    if (e.target === document.getElementById("user-orders-modal")) {
      document.getElementById("user-orders-modal").classList.add("hidden");
    }
  });
});