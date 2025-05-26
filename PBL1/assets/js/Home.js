// Ambil elemen penting
const cartBtn = document.getElementById('cart-btn');
const profileBtn = document.getElementById('profile-btn');
const cartModal = document.getElementById('cart-modal');
const profileModal = document.getElementById('profile-modal');
const cartClose = document.getElementById('cart-close');
const profileClose = document.getElementById('profile-close');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const logoutBtn = document.getElementById('logout-btn');
const userNameEl = document.getElementById('user-name');
const userEmailEl = document.getElementById('user-email');

const wishlistBtn = document.getElementById('wishlist-btn');
const wishlistModal = document.getElementById('wishlist-modal');
const wishlistClose = document.getElementById('wishlist-close');
const wishlistItemsEl = document.getElementById('wishlist-items');
const wishlistCount = document.getElementById('wishlist-count');

// User data
let currentUser = null;

// === WISHLIST FUNCTIONS ===
function getUserWishlist() {
  if (!currentUser) return [];
  const w = localStorage.getItem(`wishlist_${currentUser.email}`);
  return w ? JSON.parse(w) : [];
}

function saveUserWishlist(wishlist) {
  if (!currentUser) return;
  localStorage.setItem(`wishlist_${currentUser.email}`, JSON.stringify(wishlist));
}

function updateWishlistUI() {
  const wishlist = getUserWishlist();
  wishlistItemsEl.innerHTML = '';
  if (wishlist.length === 0) {
    wishlistItemsEl.innerHTML = '<li>Wishlist kosong</li>';
  } else {
    wishlist.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.name;
      wishlistItemsEl.appendChild(li);
    });
  }
  wishlistCount.textContent = wishlist.length;
}

function addToWishlist(productName) {
  if (!currentUser) {
    alert("Silakan login terlebih dahulu.");
    window.location.href = "/login.html";
    return;
  }

  let wishlist = getUserWishlist();
  const found = wishlist.find(item => item.name === productName);
  if (!found) {
    wishlist.push({ name: productName });
    saveUserWishlist(wishlist);
    updateWishlistUI();
    alert(`${productName} ditambahkan ke wishlist!`);
  } else {
    alert(`${productName} sudah ada di wishlist.`);
  }
}

// === CART FUNCTIONS ===
function getUserCart() {
  if (!currentUser) return [];
  const c = localStorage.getItem(`cart_${currentUser.email}`);
  return c ? JSON.parse(c) : [];
}

function saveUserCart(cart) {
  if (!currentUser) return;
  localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify(cart));
}

function updateCartUI() {
  const cart = getUserCart();
  cartItems.innerHTML = '';
  if (cart.length === 0) {
    cartItems.innerHTML = '<li>Keranjang kosong</li>';
  } else {
    cart.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name} - Qty: ${item.qty}`;
      cartItems.appendChild(li);
    });
  }
  cartCount.textContent = cart.length;
}

function addToCart(productName) {
  if (!currentUser) {
    alert("Silakan login terlebih dahulu.");
    window.location.href = "/login.html";
    return;
  }

  let cart = getUserCart();
  const existingItem = cart.find(item => item.name === productName);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ name: productName, qty: 1 });
  }
  saveUserCart(cart);
  updateCartUI();
  alert(`${productName} ditambahkan ke keranjang!`);
}

// === DOM Ready ===
document.addEventListener("DOMContentLoaded", () => {
  const userData = localStorage.getItem("user");
  if (userData && userNameEl && userEmailEl) {
    currentUser = JSON.parse(userData);
    userNameEl.textContent = currentUser.name || "-";
    userEmailEl.textContent = currentUser.email || "-";
  } else {
    window.location.href = "/login.html";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      alert("Anda telah logout.");
      window.location.href = "/login.html";
    });
  }

  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const productName = card.querySelector('h3').textContent;
      const productSlug = encodeURIComponent(productName.toLowerCase().replace(/\s+/g, '-'));
      window.location.href = `/Products-Details.html?product=${productSlug}`;
    });

    const wishlistButton = card.querySelector('.wishlist-btn');
    if (wishlistButton) {
      wishlistButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const productName = card.querySelector('h3').textContent;
        addToWishlist(productName);
      });
    }

    const cartButton = card.querySelector('.cart-btn');
    if (cartButton) {
      cartButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const productName = card.querySelector('h3').textContent;
        addToCart(productName);
      });
    }
  });

  updateCartUI();
  updateWishlistUI();
});

// === MODAL HANDLERS ===
cartBtn.addEventListener('click', () => cartModal.style.display = 'block');
cartClose.addEventListener('click', () => cartModal.style.display = 'none');

profileBtn.addEventListener('click', () => profileModal.style.display = 'block');
profileClose.addEventListener('click', () => profileModal.style.display = 'none');

wishlistBtn.addEventListener('click', () => wishlistModal.style.display = 'block');
wishlistClose.addEventListener('click', () => wishlistModal.style.display = 'none');

window.onclick = function (event) {
  if (event.target === cartModal) cartModal.style.display = 'none';
  if (event.target === profileModal) profileModal.style.display = 'none';
  if (event.target === wishlistModal) wishlistModal.style.display = 'none';
};

// === SLIDER ===
const slider = document.getElementById("slider");
const slideIndicator = document.getElementById("slideIndicator");
const totalSlides = slider.children.length;
let currentSlide = 0;

document.getElementById("nextSlide").addEventListener("click", () => {
  if (currentSlide < totalSlides - 1) {
    currentSlide++;
    updateSlider();
  }
});

document.getElementById("prevSlide").addEventListener("click", () => {
  if (currentSlide > 0) {
    currentSlide--;
    updateSlider();
  }
});

function updateSlider() {
  const slideWidth = slider.children[0].clientWidth;
  slider.style.transform = `translateX(-${slideWidth * currentSlide}px)`;
  slideIndicator.textContent = `${currentSlide + 1} / ${totalSlides}`;
}