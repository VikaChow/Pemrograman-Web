document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("productForm");
  const tableBody = document.querySelector("#productTable tbody");
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

  const loadProducts = () => {
    fetch("assets/php/home-admin.php?action=get")
      .then(res => res.json())
      .then(data => {
        tableBody.innerHTML = "";
        data.forEach(product => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.stock}</td>
            <td>${product.category}</td>
            <td>${product.subcategory}</td>
            <td>${product.expire_at}</td>
            <td>${product.description}</td>
            <td><img src="assets/images/products/${product.image}" width="60"/></td>
            <td>
              <button onclick="editProduct(${product.id})">Edit</button>
              <button onclick="deleteProduct(${product.id})">Hapus</button>
            </td>
          `;
          tableBody.appendChild(row);
        });
      })
      .catch(err => console.error("Gagal memuat produk:", err));
  };

  window.editProduct = id => {
    fetch(`assets/php/home-admin.php?action=edit&id=${id}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById("productId").value = data.id;
        document.getElementById("name").value = data.name;
        document.getElementById("price").value = data.price;
        document.getElementById("stock").value = data.stock;
        document.getElementById("category").value = data.category;

        categorySelect.dispatchEvent(new Event("change"));

        document.getElementById("subcategory").value = data.subcategory;
        document.getElementById("expire_at").value = data.expire_at;
        document.getElementById("description").value = data.description;
      })
      .catch(err => console.error("Gagal mengambil data produk:", err));
  };

  window.deleteProduct = id => {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      fetch(`assets/php/home-admin.php?action=delete&id=${id}`)
        .then(() => loadProducts())
        .catch(err => console.error("Gagal menghapus produk:", err));
    }
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(form);

    fetch("assets/php/home-admin.php?action=save", {
      method: "POST",
      body: formData
    })
    .then(() => {
      form.reset();
      subcategorySelect.style.display = "none";
      loadProducts();
    })
    .catch(err => console.error("Gagal menyimpan produk:", err));
  });

  loadProducts();
});