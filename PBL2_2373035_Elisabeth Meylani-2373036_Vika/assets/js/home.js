document.addEventListener("DOMContentLoaded", function() {
  const productList       = document.getElementById("product-list");
  const wishlistCountEl   = document.getElementById("wishlist-count");
  const cartCountEl       = document.getElementById("cart-count");
  const wishlistModal     = document.getElementById("wishlist-modal");
  const cartModal         = document.getElementById("cart-modal");
  const profileModal      = document.getElementById("profile-modal");
  const wishlistBtn       = document.getElementById("wishlist-btn");
  const cartBtn           = document.getElementById("cart-btn");
  const profileBtn        = document.getElementById("profile-btn");
  const logoutBtn         = document.getElementById("logout-btn");
  const checkoutBtn       = document.getElementById("checkout-btn");
  const orderCloseBtn     = document.getElementById("user-orders-close");
  const userOrdersModal   = document.getElementById("user-orders-modal");

  const updateCount = (url, element) => {
    fetch(url).then(res => res.json())
      .then(data => element.textContent = data.count || 0)
      .catch(() => element.textContent = "0");
  };
  const updateWishlistCount = () => updateCount("assets/php/count-wishlist.php", wishlistCountEl);
  const updateCartCount     = () => updateCount("assets/php/count-cart.php", cartCountEl);
  const truncateTextByCharacters = (text, max) => text.length <= max ? text : text.slice(0, max) + "...";
  const openModal           = (modal) => { modal.style.display = "block"; };
  const closeModal          = (modal) => { modal.style.display = "none"; };
  
  // untuk menampilkan profuk
  const loadProducts = async () => {
  try {
    const res = await fetch("assets/php/master-produk.php?action=get");
    const products = await res.json();
    productList.innerHTML = "";

    if (!Array.isArray(products) || !products.length) {
      productList.innerHTML = "<p>Tidak ada produk ditemukan.</p>";
      document.querySelector('.prev-button').style.display = "none";
      document.querySelector('.next-button').style.display = "none";
      return;
    }

    let foundNew = false;

    products.forEach(product => {
      const isNew = ((new Date() - new Date(product.created_at)) / (1000 * 60 * 60)) < 24;
      const outOfStock = product.stock == 0;

      if (isNew) {
        foundNew = true;

        const card = document.createElement("div");
        card.className = "product-item";
        card.setAttribute("data-id", product.id);
        card.innerHTML = `
          <div style="position: relative;">
            ${isNew ? '<span class="badge">NEW</span>' : ""}
            ${outOfStock ? '<span class="badge badge-out">STOK HABIS</span>' : ""}
            <img src="assets/images/products/${product.image || "default-product.png"}" alt="${product.name}">
          </div>
          <h3>${truncateTextByCharacters(product.name, 23)}</h3>
          <p class="price">Rp${parseInt(product.price).toLocaleString("id-ID")}</p>
          <div class="action-buttons">
            <button class="wishlist-btn" data-id="${product.id}" aria-label="Tambah ke Wishlist">♡</button>
            <button class="cart-btn" data-id="${product.id}" data-stock="${product.stock}" aria-label="Tambah ke Keranjang">+</button>
          </div>
        `;
        productList.appendChild(card);
      }
    });

    if (!foundNew) {
      productList.innerHTML = `
        <div style="
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          width: 100%;
        ">
          <p style="font-size: 1.2rem; color: #666; text-align: center;">
            Tidak ada produk terbaru (dalam 24 jam).
          </p>
        </div>
      `;
      document.querySelector('.prev-button').style.display = "none";
      document.querySelector('.next-button').style.display = "none";
    } else {
      document.querySelector('.prev-button').style.display = "block";
      document.querySelector('.next-button').style.display = "block";
      setupProductSlider();
      attachProductDetailHandler();
    }

  } catch {
    productList.innerHTML = "<p>Gagal memuat produk.</p>";
    document.querySelector('.prev-button').style.display = "none";
    document.querySelector('.next-button').style.display = "none";
  }
};
  
  const attachProductDetailHandler = () => {
    document.querySelectorAll('.product-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains("wishlist-btn") && !e.target.classList.contains("cart-btn")) {
          const id = item.getAttribute("data-id");
          window.location.href = `Product-Detail.html?id=${id}`;
        }
      });
    });
  };
  
  const setupProductSlider = () => {
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');
    if (!prevButton || !nextButton || !productList) return;

    let currentIndex = 0;
    const itemsPerView = 4;

    const updateSlider = () => {
      const totalItems = productList.children.length;
      const maxIndex = Math.ceil(totalItems / itemsPerView) - 1;

      currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
      productList.style.transition = "transform 0.5s ease";
      productList.style.transform = `translateX(-${currentIndex * 100}%)`;

      prevButton.style.display = currentIndex <= 0 ? "none" : "block";
      nextButton.style.display = currentIndex >= maxIndex ? "none" : "block";
    };
    prevButton.addEventListener("click", () => {
      currentIndex--; 
      updateSlider();
    });
    nextButton.addEventListener("click", () => {
      currentIndex++; 
      updateSlider();
    });
    updateSlider();
  };
  
  // modal untuk wishlist
  wishlistBtn?.addEventListener("click", async () => {
    try {
      const res = await fetch("assets/php/get-wishlist.php");
      const data = await res.json();
      const container = document.getElementById("wishlist-items");
      container.innerHTML = ""; 

      if (!Array.isArray(data) || !data.length) {
        container.innerHTML = "<p>Wishlist kosong.</p>";
      } else {
        data.forEach(item => {
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
    } catch {
      swal.fire("Gagal memuat wishlist.");
    }
  });
  
  // modal untuk cart
  cartBtn?.addEventListener("click", async () => {
    try {
      const res = await fetch("assets/php/get-cart.php");
      const data = await res.json();
      const container = document.getElementById("cart-items");
      container.innerHTML = ""; 

      if (!Array.isArray(data.data) || !data.data.length) {
        container.innerHTML = "<p>Keranjang kosong.</p>";
      } else {
        data.data.forEach(item => {
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
    } catch {
      Swal.fire("Gagal memuat keranjang.");
    }
  });
  
  // modal untuk profile
  profileBtn?.addEventListener("click", async () => {
    try {
      const res = await fetch("assets/php/get-profile.php");
      const data = await res.json();
      if (data.success) {
        document.getElementById("user-name").textContent = data.name;
        document.getElementById("user-email").textContent = data.email;
        openModal(profileModal);
      } else {
        Swal.fire("Login Dulu", "Silakan login terlebih dahulu.", "info").then(() => {
          window.location.href = "Login.html";
        });
      }
    } catch {
      Swal.fire("Error", "Terjadi kesalahan saat mengambil profil.", "error");
    }
  });
  
  window.addEventListener("click", e => {
    if (e.target === wishlistModal) closeModal(wishlistModal);
    if (e.target === cartModal) closeModal(cartModal);
    if (e.target === profileModal) closeModal(profileModal);
    if (e.target === userOrdersModal) userOrdersModal.classList.add("hidden");
  });

  orderCloseBtn?.addEventListener("click", () => {
    userOrdersModal.classList.add("hidden");
  });
  
  // untuk logout
  logoutBtn?.addEventListener("click", async () => {
    try {
      await fetch("assets/php/logout.php");
      window.location.href = "Login.html";
    } catch {
      Swal.fire("Error", "Gagal logout.", "error");
    }
  });
  
  // untuk tombol tambah dan hapus produk ke wishlist dan cart
  document.addEventListener("click", async e => {
    const target = e.target;

    if (target.classList.contains("wishlist-btn")) {
      const productId = target.getAttribute("data-id");
      try {
        const res = await fetch("assets/php/add-to-wishlist.php", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({product_id: productId})
        });
        const data = await res.json();
        Swal.fire("Info", data.message, data.success ? "success" : "error");
        updateWishlistCount();
      } catch {
        Swal.fire("Error", "Gagal menambahkan ke wishlist.", "error");
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
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({product_id: productId})
        });
        const data = await res.json();
        Swal.fire("Info", data.message, data.success ? "success" : "error");
        updateCartCount();
      } catch {
        Swal.fire("Error", "Gagal menambahkan ke keranjang.", "error");
      }
    }

    if (target.classList.contains("remove-wishlist")) {
      const productId = parseInt(target.getAttribute("data-id"));
      try {
        const res = await fetch("assets/php/remove-from-wishlist.php", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({product_id: productId})
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
          Swal.fire("Gagal", data.message, "error");
        }
      } catch {
        Swal.fire("Error", "Gagal menghapus dari wishlist.", "error");
      }
    }

    if (target.classList.contains("remove-cart")) {
      const productId = parseInt(target.getAttribute("data-id"));
      try {
        const res = await fetch("assets/php/remove-from-cart.php", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({product_id: productId})
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
          Swal.fire("Gagal", data.message, "error");
        }
      } catch {
        aSwal.fire("Error", "Gagal menghapus dari keranjang.", "error");
      }
    }
  });
  
  // untuk menampilkan banner
  const loadBanners = async () => {
    try {
      const res = await fetch("assets/php/banner.php?action=get");
      const banners = await res.json();
      const slider = document.getElementById("slider");
      slider.innerHTML = ""; 
      banners.forEach(banner => {
        const img = document.createElement("img");
        img.src = `assets/images/banner/${banner.image}`;
        img.alt = "Banner";
        slider.appendChild(img);
      });
      setupBannerSlider();
    } catch {
      console.error("Gagal memuat banner.");
    }
  };
  
  // untuk slide banner
  const setupBannerSlider = () => {
    const slider = document.getElementById("slider");
    const slides = slider.querySelectorAll("img");
    const totalSlides = slides.length;

    const prevBtn = document.getElementById("prevSlide");
    const nextBtn = document.getElementById("nextSlide");
    const slideIndicator = document.getElementById("slideIndicator");

    let currentIndex = 0;
    let autoSlideInterval;

    const updateSlider = () => {
      slider.style.transition = "transform 0.5s ease";
      slider.style.transform = `translateX(-${currentIndex * 100}%)`;
      if (slideIndicator) slideIndicator.textContent = `${currentIndex + 1} / ${totalSlides}`;
    };
    const showNext = () => {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateSlider();
    };
    const showPrev = () => {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      updateSlider();
    };
    const startAutoSlide = () => autoSlideInterval = setInterval(showNext, 5000);
    const stopAutoSlide = () => clearInterval(autoSlideInterval);

    prevBtn?.addEventListener("click", () => { showPrev(); stopAutoSlide(); startAutoSlide(); });
    nextBtn?.addEventListener("click", () => { showNext(); stopAutoSlide(); startAutoSlide(); });
    slider.parentElement?.addEventListener("mouseenter", stopAutoSlide);
    slider.parentElement?.addEventListener("mouseleave", startAutoSlide);

    updateSlider();
    startAutoSlide();
  };
  
  // untuk checkout
  checkoutBtn?.addEventListener("click", async () => {
    try {
      const res = await fetch("assets/php/get-cart.php");
      const data = await res.json();
      if (!data.data || !data.data.length) {
        Swal.fire("Keranjang Kosong", "Tambahkan produk dulu sebelum checkout.", "info");
      } else {
        window.location.href = "Checkout.html";
      }
    } catch {
      Swal.fire("Error", "Gagal cek keranjang.", "error");
    }
  });
  
  // untuk melihat pesanan saya di profile
  document.getElementById("my-orders-btn")?.addEventListener("click", async () => {
    try {
      const res = await fetch("assets/php/get-user-orders.php");
      const data = await res.json();
      const container = document.getElementById("user-orders-container");
      container.innerHTML = ""; 
      if (data.success && Array.isArray(data.orders)) {
        if (!data.orders.length) {
          container.innerHTML = "<p>Kamu belum memiliki pesanan.</p>";
        } else {
          data.orders.forEach(order => {
            const div = document.createElement("div");
            div.classList.add("order-card");
            div.innerHTML = `
              <h3>#ORD${order.order_id}</h3>
              <p><strong>Tanggal:</strong> ${order.created_at}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              <p><strong>Total:</strong> Rp${order.total_price}</p>
              <p><strong>Produk:</strong> ${Array.isArray(order.products) ? order.products.join(', ') : order.products}</p>
              <hr/>
            `;
            container.appendChild(div);
          });
        }
        userOrdersModal?.classList.remove("hidden");
      } else {
        Swal.fire("Oops", "Gagal mengambil data pesanan.", "error");
      }
    } catch {
      Swal.fire("Error", "Terjadi kesalahan saat mengambil data.", "error");
    }
  });
  
  // untuk pencarian produk
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

  updateWishlistCount();
  updateCartCount();
  loadProducts();
  loadBanners();
});