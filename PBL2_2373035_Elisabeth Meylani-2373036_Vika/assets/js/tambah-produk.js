document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("productForm");
  const categorySelect = document.getElementById("category");
  const subcategorySelect = document.getElementById("subcategory");
  const logoutBtn = document.getElementById("logout-btn");

  const subcategories = {
    face: ["Blush On", "Concealer", "Contour", "Foundation", "Highlighter", "Powder"],
    eyes: ["Eyebrow", "Eyeliner", "Eye Pallete", "Eyeshadow", "Mascara"],
    lips: ["Lip Balm", "Lip Gloss", "Lip Liquid", "Lip Pallate", "Lip Pencil", "Lipstik"],
    skin: ["Cleanser", "Setting Spray"]
  };

  // Update subcategory options on category change
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

  // Handle form submission
  form.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(form);

    fetch("assets/php/master-produk.php?action=save", {
      method: "POST",
      body: formData
    })
    .then(res => {
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return res.json(); // Jika PHP kamu kirim JSON, pastikan ini
    })
    .then(data => {
      Swal.fire({
        title: "Berhasil",
        text: data.message || "Produk berhasil disimpan!",
        icon: "success"
      }).then(() => {
        form.reset();
        subcategorySelect.style.display = "none";
        window.location.href = "Master-Produk.html";
      });
    })
    .catch(err => {
      console.error("Gagal menyimpan produk:", err);
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan produk.", "error");
    });
  });

  // Handle logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      Swal.fire({
        title: "Yakin ingin logout?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, logout",
        cancelButtonText: "Batal"
      }).then(result => {
        if (result.isConfirmed) {
          fetch('assets/php/logout.php')
            .then(res => {
              if (!res.ok) throw new Error(`Status ${res.status}`);
              return res.json();
            })
            .then(data => {
              console.log(data);
              window.location.href = 'Login.html';
            })
            .catch(err => {
              console.error('Gagal logout:', err);
              Swal.fire("Gagal", "Gagal logout. Silakan coba lagi.", "error");
            });
        }
      });
    });
  }

  // Kalau memang ada loadProducts
  if (typeof loadProducts === "function") {
    loadProducts();
  }
});