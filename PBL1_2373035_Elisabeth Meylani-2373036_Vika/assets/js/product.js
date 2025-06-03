document.addEventListener("DOMContentLoaded", function () {
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

  function updateWishlistCount() {
    fetch('assets/php/count-wishlist.php')
      .then(res => res.json())
      .then(data => {
        wishlistCountEl.textContent = data.count || 0;
      })
      .catch(() => {
        wishlistCountEl.textContent = 0;
      });
  }

  function updateCartCount() {
    fetch('assets/php/count-cart.php')
      .then(res => res.json())
      .then(data => {
        cartCountEl.textContent = data.count || 0;
      })
      .catch(() => {
        cartCountEl.textContent = 0;
      });
  }

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
          openModal(wishlistModal);
          return;
        }

        data.forEach(item => {
          const div = document.createElement('div');
          div.innerHTML = `
            <div class="modal-item">
              <img src="assets/images/products/${item.image}" alt="${item.name}" width="50">
              <span>${item.name}</span>
            </div>`;
          container.appendChild(div);
        });

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

        if (!Array.isArray(data) || data.length === 0) {
          container.innerHTML = '<p>Keranjang kosong.</p>';
          openModal(cartModal);
          return;
        }

        data.forEach(item => {
          const div = document.createElement('div');
          div.innerHTML = `
            <div class="modal-item">
              <img src="assets/images/products/${item.image}" alt="${item.name}" width="50">
              <span>${item.name} x ${item.quantity}</span>
            </div>`;
          container.appendChild(div);
        });

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
      .catch(err => {
        console.error('Gagal mengambil data profil:', err);
        alert('Terjadi kesalahan saat mengambil profil.');
      });
  });

  wishlistClose?.addEventListener('click', () => closeModal(wishlistModal));
  cartClose?.addEventListener('click', () => closeModal(cartModal));
  profileClose?.addEventListener('click', () => closeModal(profileModal));

  window.addEventListener('click', (event) => {
    if (event.target === wishlistModal) closeModal(wishlistModal);
    if (event.target === cartModal) closeModal(cartModal);
    if (event.target === profileModal) closeModal(profileModal);
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      fetch('assets/php/logout.php')
        .then(() => {
          window.location.href = 'Login.html';
        })
        .catch(err => {
          console.error('Gagal logout:', err);
          alert('Gagal logout. Silakan coba lagi.');
        });
    });
  }

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
    });

  updateWishlistCount();
  updateCartCount();
});

const params = new URLSearchParams(window.location.search);
const category = params.get("category");
const subcategory = params.get("subcategory");

document.getElementById("product-title").textContent = `Produk ${subcategory || ""}`;

function loadProducts(category, subcategory) {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "<p>Memuat produk...</p>";

  fetch(`assets/php/get-products.php?category=${category}&subcategory=${subcategory}`)
    .then(res => res.json())
    .then(data => {
      productList.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        productList.innerHTML = "<p>Tidak ada produk ditemukan.</p>";
        return;
      }

      data.forEach(product => {
        const item = document.createElement("div");
        item.className = "product-item";

        const imageSrc = `assets/images/products/${product.image}`;
        const priceNumber = Number(product.price);
        const formattedPrice = isNaN(priceNumber) ? "Rp0" : `Rp${priceNumber.toLocaleString('id-ID')}`;

        item.innerHTML = `
          <span class="badge">NEW</span>
          <div class="action-buttons">
            <button class="wishlist-btn" data-id="${product.id}" aria-label="Tambah ke Wishlist">♡</button>
            <button class="cart-btn" data-id="${product.id}" aria-label="Tambah ke Keranjang">+</button>
          </div>
          <img src="${imageSrc}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p class="price">${formattedPrice}</p>
        `;
        productList.appendChild(item);
      });
    })
    .catch(() => {
      productList.innerHTML = "<p>Gagal memuat produk.</p>";
    });
}

loadProducts(category, subcategory);