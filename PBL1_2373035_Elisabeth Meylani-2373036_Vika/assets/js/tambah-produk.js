document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("productForm");
  const categorySelect = document.getElementById("category");
  const subcategorySelect = document.getElementById("subcategory");

  const subcategories = {
    face: ["Blush On", "Concealer", "Contour", "Foundation", "Highlighter", "Powder"],
    eyes: ["Eyebrow", "Eyeliner", "Eye Pallete", "Eyeshadow", "Mascara"],
    lips: ["Lip Balm", "Lip Gloss", "Lip Liquid", "Lip Pallate", "Lip Pencil", "Lipstik"],
    skin: ["Cleanser", "Setting Spray"]
  };

  categorySelect.addEventListener("change", () => {
    const selectedCategory = categorySelect.value;
    subcategorySelect.innerHTML = '<option value="">-- Pilih Subkategori --</option>';

    if (selectedCategory && subcategories[selectedCategory]) {
      subcategories[selectedCategory].forEach(sub => {
        const option = document.createElement("option");
        option.value = sub.toLowerCase().replace(/\s+/g, '_');
        option.textContent = sub;
        subcategorySelect.appendChild(option);
      });
      subcategorySelect.style.display = "block";
    } else {
      subcategorySelect.style.display = "none";
    }
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(form);

    fetch("assets/php/master-produk.php?action=save", {
      method: "POST",
      body: formData
    })
    .then(() => {
      alert("Produk berhasil disimpan!");
      form.reset();
      subcategorySelect.style.display = "none";
      window.location.href = "Master-Produk.html";
    })
    .catch(err => {
      console.error("Gagal menyimpan produk:", err);
      alert("Terjadi kesalahan saat menyimpan produk.");
    });
  });

  loadProducts();
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