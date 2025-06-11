document.addEventListener("DOMContentLoaded", function () {
  // === DOM Elements ===
  const productList = document.getElementById('product-list');
  const wishlistCountEl = document.getElementById('wishlist-count');
  const cartCountEl = document.getElementById('cart-count');
  const wishlistModal = document.getElementById('wishlist-modal');
  const cartModal = document.getElementById('cart-modal');
  const profileModal = document.getElementById('profile-modal');
  const wishlistBtn = document.getElementById('wishlist-btn');
  const cartBtn = document.getElementById('cart-btn');
  const profileBtn = document.getElementById('profile-btn');
  const wishlistClose = document.getElementById('wishlist-close');
  const cartClose = document.getElementById('cart-close');
  const profileClose = document.getElementById('profile-close');
  const logoutBtn = document.getElementById('logout-btn');
  const checkoutBtn = document.getElementById("checkout-btn");

  // === Update Wishlist & Cart Count ===
  function updateCount(url, el) {
    fetch(url)
      .then(res => res.json())
      .then(data => el.textContent = data.count || 0)
      .catch(() => el.textContent = 0);
  }

  function updateWishlistCount() {
    updateCount('assets/php/count-wishlist.php', wishlistCountEl);
  }

  function updateCartCount() {
    updateCount('assets/php/count-cart.php', cartCountEl);
  }

  // === Load Products ===
  function loadProducts() {
    fetch('assets/php/master-produk.php?action=get')
      .then(res => res.json())
      .then(products => {
        productList.innerHTML = "";
        if (!products || products.length === 0) {
          productList.innerHTML = "<p>Tidak ada produk ditemukan.</p>";
          return;
        }
        products.forEach(product => {
          const card = document.createElement('div');
          card.className = 'product-card';
          const imageSrc = product.image
            ? `assets/images/products/${product.image}`
            : 'assets/images/default-product.jpg';
          card.innerHTML = `
            <span class="badge">NEW</span>
            <div class="action-buttons">
              <button class="wishlist-btn" data-id="${product.id}" aria-label="Tambah ke Wishlist">♡</button>
              <button class="cart-btn" data-id="${product.id}" aria-label="Tambah ke Keranjang">+</button>
            </div>
            <img src="${imageSrc}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">Rp${parseInt(product.price).toLocaleString('id-ID')}</p>
          `;
          productList.appendChild(card);
        });
      })
      .catch(() => {
        productList.innerHTML = "<p>Gagal memuat produk.</p>";
      });
  }

  // === Modal Open/Close ===
  function openModal(modal) {
    modal.style.display = 'block';
  }

  function closeModal(modal) {
    modal.style.display = 'none';
  }

  wishlistBtn?.addEventListener('click', () => {
    fetch('assets/php/get-wishlist.php')
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('wishlist-items');
        container.innerHTML = '';
        if (!Array.isArray(data) || data.length === 0) {
          container.innerHTML = '<p>Wishlist kosong.</p>';
        } else {
          data.forEach(item => {
            const div = document.createElement('div');
            div.innerHTML = `
              <div class="modal-item">
                <img src="assets/images/products/${item.image}" alt="${item.name}" width="50">
                <span>${item.name}</span>
                <button class="remove-wishlist" data-id="${item.id}" aria-label="Hapus dari wishlist">❌</button>
              </div>`;
            container.appendChild(div);
          });
        }
        openModal(wishlistModal);
      })
      .catch(() => alert('Gagal memuat wishlist.'));
  });

  cartBtn?.addEventListener('click', () => {
    fetch('assets/php/get-cart.php')
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('cart-items');
        container.innerHTML = '';
        if (!Array.isArray(data.data) || data.data.length === 0) {
          container.innerHTML = '<p>Keranjang kosong.</p>';
        } else {
          data.data.forEach(item => {
            const div = document.createElement('div');
            div.innerHTML = `
              <div class="modal-item">
                <img src="assets/images/products/${item.image}" alt="${item.name}" width="50">
                <span>${item.quantity} x ${item.name}</span>
                <p>Rp${(item.price * item.quantity).toLocaleString("id-ID")}</p>
                <button class="remove-cart" data-id="${item.id}" aria-label="Hapus dari keranjang">❌</button>
              </div>`;
            container.appendChild(div);
          });
        }
        openModal(cartModal);
      })
      .catch(() => alert('Gagal memuat keranjang.'));
  });

  profileBtn?.addEventListener('click', () => {
    fetch('assets/php/get-profile.php')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById('user-name').textContent = data.name;
          document.getElementById('user-email').textContent = data.email;
          openModal(profileModal);
        } else {
          alert('Silakan login terlebih dahulu.');
          window.location.href = 'Login.html';
        }
      })
      .catch(() => alert('Terjadi kesalahan saat mengambil profil.'));
  });

  wishlistClose?.addEventListener('click', () => closeModal(wishlistModal));
  cartClose?.addEventListener('click', () => closeModal(cartModal));
  profileClose?.addEventListener('click', () => closeModal(profileModal));

  window.addEventListener('click', (e) => {
    if (e.target === wishlistModal) closeModal(wishlistModal);
    if (e.target === cartModal) closeModal(cartModal);
    if (e.target === profileModal) closeModal(profileModal);
    if (e.target === document.getElementById("user-orders-modal")) {
      document.getElementById("user-orders-modal").classList.add("hidden");
    }
  });

  logoutBtn?.addEventListener('click', () => {
    fetch('assets/php/logout.php')
      .then(() => {
        window.location.href = 'Login.html';
      })
      .catch(() => alert('Gagal logout. Silakan coba lagi.'));
  });

  // === Add to Wishlist / Cart ===
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('wishlist-btn')) {
      const productId = e.target.getAttribute('data-id');
      fetch('assets/php/add-to-wishlist.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
      })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          updateWishlistCount();
        })
        .catch(() => alert('Gagal menambahkan ke wishlist.'));
    }

    if (e.target.classList.contains('cart-btn')) {
      const productId = e.target.getAttribute('data-id');
      fetch('assets/php/add-to-cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
      })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          updateCartCount();
        })
        .catch(() => alert('Gagal menambahkan ke keranjang.'));
    }

    if (e.target.classList.contains('remove-wishlist')) {
      const productId = e.target.getAttribute('data-id');
      fetch('assets/php/remove-from-wishlist.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
      })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          updateWishlistCount();
          wishlistBtn.click(); // Refresh modal
        })
        .catch(() => alert('Gagal menghapus dari wishlist.'));
    }

    if (e.target.classList.contains('remove-cart')) {
      const productId = e.target.getAttribute('data-id');
      fetch('assets/php/remove-from-cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
      })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          updateCartCount();
          cartBtn.click(); // Refresh modal
        })
        .catch(() => alert('Gagal menghapus dari keranjang.'));
    }
  });

  // === Load Banners ===
  function loadBanners() {
    const slider = document.getElementById('slider');
    fetch('assets/php/banner.php?action=get')
      .then(res => res.json())
      .then(banners => {
        slider.innerHTML = '';
        banners.forEach(banner => {
          const img = document.createElement('img');
          img.src = `assets/images/banner/${banner.image}`;
          img.alt = 'Banner';
          slider.appendChild(img);
        });

        const slides = slider.querySelectorAll('img');
        const totalSlides = slides.length;
        const prevBtn = document.getElementById('prevSlide');
        const nextBtn = document.getElementById('nextSlide');
        const slideIndicator = document.getElementById('slideIndicator');
        let currentIndex = 0;
        let autoSlideInterval;

        function updateSlider() {
          slider.style.transform = `translateX(-${currentIndex * 100}%)`;
          if (slideIndicator) {
            slideIndicator.textContent = `${currentIndex + 1} / ${totalSlides}`;
          }
        }

        function showNext() {
          currentIndex = (currentIndex + 1) % totalSlides;
          updateSlider();
        }

        function showPrev() {
          currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
          updateSlider();
        }

        function startAutoSlide() {
          autoSlideInterval = setInterval(showNext, 5000);
        }

        function stopAutoSlide() {
          clearInterval(autoSlideInterval);
        }

        prevBtn?.addEventListener('click', () => {
          showPrev();
          stopAutoSlide();
          startAutoSlide();
        });

        nextBtn?.addEventListener('click', () => {
          showNext();
          stopAutoSlide();
          startAutoSlide();
        });

        slider.parentElement.addEventListener('mouseenter', stopAutoSlide);
        slider.parentElement.addEventListener('mouseleave', startAutoSlide);

        updateSlider();
        startAutoSlide();
      })
      .catch(() => console.error('Gagal memuat banner.'));
  }

  // === INIT ===
  updateWishlistCount();
  updateCartCount();
  loadProducts();
  loadBanners();

  checkoutBtn?.addEventListener("click", () => {
    fetch('assets/php/get-cart.php')
      .then(res => res.json())
      .then(data => {
        const items = data.data;
        if (!items || items.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Keranjang Kosong',
            text: 'Silakan tambahkan produk ke keranjang sebelum checkout.',
            confirmButtonColor: '#3085d6'
          });
        } else {
          window.location.href = "checkout.html";
        }
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Mengecek Keranjang',
          text: 'Terjadi kesalahan. Coba lagi nanti.',
          confirmButtonColor: '#d33'
        });
      });
  });

  // === My Orders Modal ===
  document.getElementById('my-orders-btn').addEventListener('click', () => {
    fetch('assets/php/get-user-orders.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.orders)) {
          const container = document.getElementById('user-orders-container');
          container.innerHTML = '';
          if (data.orders.length === 0) {
            container.innerHTML = '<p>Kamu belum memiliki pesanan.</p>';
          } else {
            data.orders.forEach(order => {
              const div = document.createElement('div');
              div.classList.add('order-card');
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
          document.getElementById('user-orders-modal').classList.remove('hidden');
        } else {
          Swal.fire("Oops", "Gagal mengambil data pesanan.", "error");
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        Swal.fire("Error", "Terjadi kesalahan saat mengambil data.", "error");
      });
  });

  document.getElementById('user-orders-close').addEventListener('click', () => {
    document.getElementById('user-orders-modal').classList.add('hidden');
  });
});