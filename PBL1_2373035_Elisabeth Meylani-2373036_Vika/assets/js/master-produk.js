document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#productTable tbody");
  const categorySelect = document.getElementById("category");
  const subcategorySelect = document.getElementById("subcategory");

  const loadProducts = () => {
    fetch("assets/php/master-produk.php?action=get")
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
    fetch(`assets/php/master-produk.php?action=edit&id=${id}`)
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
      fetch(`assets/php/master-produk.php?action=delete&id=${id}`)
        .then(() => loadProducts())
        .catch(err => console.error("Gagal menghapus produk:", err));
    }
  };
  
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