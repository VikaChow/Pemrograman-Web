document.addEventListener("DOMContentLoaded", () => {
  const productContainer = document.getElementById("product-detail-container");

  // Tombol di navbar/header
  const wishlistBtn = document.getElementById("wishlist-btn");
  const cartBtn = document.getElementById("cart-btn");
  const profileBtn = document.getElementById("profile-btn");

  // Count di tombol
  const cartCount = document.getElementById("cart-count");
  const wishlistCount = document.getElementById("wishlist-count");

  // Modal sesuai id HTML yang kamu kasih
  const wishlistModal = document.getElementById("wishlist-modal");
  const cartModal = document.getElementById("cart-modal");
  const profileModal = document.getElementById("profile-modal");

  // Tombol close di modal sesuai id HTML
  const wishlistClose = document.getElementById("wishlist-close");
  const cartClose = document.getElementById("cart-close");
  const profileClose = document.getElementById("profile-close");

  // Profil info elemen
  const userNameEl = document.getElementById("user-name");
  const userEmailEl = document.getElementById("user-email");

  // List elemen untuk isi modal
  const wishlistItemsEl = document.getElementById("wishlist-items");
  const cartItemsEl = document.getElementById("cart-items");

  // Ambil data user dari localStorage
  let currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) {
    alert("Silakan login terlebih dahulu.");
    window.location.href = "/login.html";
    return;
  }

  // Fungsi helper: ambil param url
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  // Data produk (dummy)
  function getProductData() {
    return [
      {
        slug: "make-over-powerstay-sync-matte-cushion",
        name: "MAKE OVER POWERSTAY SYNC MATTE CUSHION",
        description: "Kualitas cushion matte terbaik untuk tampilan flawless yang tahan lama.",
        price: "Rp239.000",
        images: ["/assets/images/products/Makara pink flash.png"],
        colors: ["#f5d6c6", "#eec8b4", "#e0b8a2", "#d2a890"]
      },
      // produk lain ...
    ];
  }

  // Ambil dan simpan cart/wishlist dari localStorage per user
  function getCart() {
    const data = localStorage.getItem(`cart_${currentUser.email}`);
    return data ? JSON.parse(data) : [];
  }
  function saveCart(cart) {
    localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify(cart));
  }

  function getWishlist() {
    const data = localStorage.getItem(`wishlist_${currentUser.email}`);
    return data ? JSON.parse(data) : [];
  }
  function saveWishlist(wishlist) {
    localStorage.setItem(`wishlist_${currentUser.email}`, JSON.stringify(wishlist));
  }

  // Update jumlah item di cart dan wishlist tombol
  function updateCounts() {
    const cart = getCart();
    const wishlist = getWishlist();
    cartCount.textContent = cart.length;
    wishlistCount.textContent = wishlist.length;
  }

  // Render produk detail
  function renderProduct(product) {
    let colorsHtml = product.colors.map(c =>
      `<span class="color" style="background-color: ${c}; display:inline-block; width:20px; height:20px; border-radius:50%; margin-right:5px; border: 1px solid #ccc;"></span>`
    ).join('');

    productContainer.innerHTML = `
      <h1>${product.name}</h1>
      <img src="${product.images[0]}" alt="${product.name}" style="max-width:300px; width:100%; border-radius:10px;" />
      <p style="margin-top:10px;">${product.description}</p>
      <p style="font-weight:bold; font-size:1.2em;">Harga: ${product.price}</p>
      <div>
        <strong>Warna:</strong> ${colorsHtml}
      </div>
      <div style="margin-top:20px;">
        <button id="addToCartBtn" style="padding:10px 20px; background:#f04e30; color:#fff; border:none; border-radius:5px; cursor:pointer; margin-right:10px;">
          Tambah ke Keranjang
        </button>
        <button id="addToWishlistBtn" style="padding:10px 20px; background:#ffb400; color:#fff; border:none; border-radius:5px; cursor:pointer;">
          Tambah ke Wishlist
        </button>
      </div>
    `;

    document.getElementById("addToCartBtn").addEventListener("click", () => {
      let cart = getCart();
      const found = cart.find(item => item.slug === product.slug);
      if (found) {
        found.qty += 1;
      } else {
        cart.push({ slug: product.slug, name: product.name, qty: 1 });
      }
      saveCart(cart);
      updateCounts();
      alert(`${product.name} ditambahkan ke keranjang.`);
    });

    document.getElementById("addToWishlistBtn").addEventListener("click", () => {
      let wishlist = getWishlist();
      const found = wishlist.find(item => item.slug === product.slug);
      if (!found) {
        wishlist.push({ slug: product.slug, name: product.name });
        saveWishlist(wishlist);
        updateCounts();
        alert(`${product.name} ditambahkan ke wishlist.`);
      } else {
        alert(`${product.name} sudah ada di wishlist.`);
      }
    });
  }

  // Isi konten modal keranjang
  function updateCartModalContent() {
    const cart = getCart();
    if (cart.length === 0) {
      cartItemsEl.innerHTML = "<li>Keranjang kosong</li>";
    } else {
      cartItemsEl.innerHTML = cart.map(item =>
        `<li>${item.name} x${item.qty}</li>`
      ).join("");
    }
  }

  // Isi konten modal wishlist
  function updateWishlistModalContent() {
    const wishlist = getWishlist();
    if (wishlist.length === 0) {
      wishlistItemsEl.innerHTML = "<li>Wishlist kosong</li>";
    } else {
      wishlistItemsEl.innerHTML = wishlist.map(item =>
        `<li>${item.name}</li>`
      ).join("");
    }
  }

  // Tampilkan modal & update isi modal saat tombol diklik
  cartBtn.addEventListener("click", () => {
    updateCartModalContent();
    cartModal.style.display = "block";
  });
  wishlistBtn.addEventListener("click", () => {
    updateWishlistModalContent();
    wishlistModal.style.display = "block";
  });
  profileBtn.addEventListener("click", () => {
    userNameEl.textContent = currentUser.name || "-";
    userEmailEl.textContent = currentUser.email || "-";
    profileModal.style.display = "block";
  });

  // Tutup modal saat tombol close diklik
  cartClose.addEventListener("click", () => {
    cartModal.style.display = "none";
  });
  wishlistClose.addEventListener("click", () => {
    wishlistModal.style.display = "none";
  });
  profileClose.addEventListener("click", () => {
    profileModal.style.display = "none";
  });

  // Tutup modal saat klik di luar konten modal
  window.addEventListener("click", (e) => {
    if (e.target === cartModal) cartModal.style.display = "none";
    if (e.target === wishlistModal) wishlistModal.style.display = "none";
    if (e.target === profileModal) profileModal.style.display = "none";
  });

  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "/login.html";
  });

  // Render produk di halaman detail
  const slug = getQueryParam("product");
  const product = getProductData().find(p => p.slug === slug);

  if (!product) {
    productContainer.innerHTML = "<p>Produk tidak ditemukan.</p>";
  } else {
    renderProduct(product);
  }

  updateCounts();
});