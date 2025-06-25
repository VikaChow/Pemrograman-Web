document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#productTable tbody");
  const rowsPerPageSelect = document.getElementById("rowsPerPage");
  const logoutBtn = document.getElementById("logout-btn");
  const modal = document.getElementById("editModal");
  const closeModalBtn = document.getElementById("closeModal");
  const form = document.getElementById("editForm");

  let currentEditId = null;
  const nameField = document.getElementById("edit_nama");
  const priceField = document.getElementById("edit_harga");
  const stockField = document.getElementById("edit_stok");
  const categoryField = document.getElementById("edit_kategori");
  const subcategoryField = document.getElementById("edit_subkategori");
  const expireField = document.getElementById("edit_expired");
  const descriptionField = document.getElementById("edit_deskripsi");
  const imagePreview = document.getElementById("currentImage");
  const imageField = document.getElementById("edit_gambar");

  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const pageIndicator = document.getElementById("pageIndicator");
  const searchInput = document.getElementById("searchInput");

  let allRows = [];
  let filteredRows = [];
  let currentPage = 1;

  const subkategoriList = {
    face: ["Blush On", "Concealer", "Contour", "Foundation", "Highlighter", "Powder"],
    eyes: ["Eyebrow", "Eyeliner", "Eye Pallete", "Eyeshadow", "Mascara"],
    lips: ["Lip Balm", "Lip Gloss", "Lip Liquid", "Lip Pallate", "Lip Pencil", "Lipstik"],
    skin: ["Cleanser", "Setting Spray"]
  };

  categoryField.addEventListener("change", () => {
    const kategoriValue = categoryField.value;
    subcategoryField.innerHTML = '<option value="">-- Pilih Subkategori --</option>';
    if (subkategoriList[kategoriValue]) {
      subcategoryField.style.display = "block";
      subkategoriList[kategoriValue].forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        subcategoryField.appendChild(option);
      });
    } else {
      subcategoryField.style.display = "none";
    }
  });

  function shortenText(text, maxLength = 100) {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }

  function updateTableRows() {
    const rowsPerPage = parseInt(rowsPerPageSelect.value) || 10;
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    tableBody.innerHTML = "";
    const rowsToDisplay = filteredRows.slice(start, end);
    rowsToDisplay.forEach(row => tableBody.appendChild(row));

    const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
    pageIndicator.textContent = `Halaman ${currentPage} dari ${totalPages}`;

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
  }

  function loadProducts() {
    fetch("assets/php/master-produk.php?action=get")
      .then(res => res.json())
      .then(data => {
        allRows = data.map(product => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${product.name || "-"}</td>
            <td>${product.price || "-"}</td>
            <td>${product.stock || 0}</td>
            <td>${product.category || "-"}</td>
            <td>${product.subcategory || "-"}</td>
            <td>${product.expire_at || "-"}</td>
            <td class="description">${shortenText(product.description || "", 80)}</td>
            <td><img src="assets/images/products/${product.image || "no-image.png"}" width="60" /></td>
            <td>
              <button class="edit" onclick="editProduct(${product.id})">Edit</button>
              <button class="delete" onclick="deleteProduct(${product.id})">Hapus</button>
            </td>
          `;
          return row;
        });

        filteredRows = allRows.slice();
        currentPage = 1;
        updateTableRows();
      })
      .catch(err => {
        console.error("Gagal memuat produk:", err);
        tableBody.innerHTML = "<tr><td colspan='9'>Gagal memuat data.</td></tr>";
      });
  }

  // Awal Pake AI
  searchInput.addEventListener("input", function () {
    const keyword = this.value.toLowerCase();
    if (keyword === "") {
      filteredRows = allRows.slice();
    } else {
      filteredRows = allRows.filter(row => {
        return Array.from(row.querySelectorAll("td"))
          .some(td => td.textContent.toLowerCase().includes(keyword));
      });
    }
    currentPage = 1;
    updateTableRows();
  });

  rowsPerPageSelect.addEventListener("change", () => {
    currentPage = 1;
    updateTableRows();
  });

  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      updateTableRows();
    }
  });

  nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredRows.length / parseInt(rowsPerPageSelect.value)) || 1;
    if (currentPage < totalPages) {
      currentPage++;
      updateTableRows();
    }
  });
  // Akhir Pake AI

  window.editProduct = function(id) {
    fetch(`assets/php/master-produk.php?action=edit&id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data) {
          Swal.fire("Gagal", "Produk tidak ditemukan.", "error");
          return;
        }

        currentEditId = data.id;
        nameField.value = data.name || "";
        priceField.value = data.price || "";
        stockField.value = data.stock || "";
        categoryField.value = data.category || "";
        descriptionField.value = data.description || "";

        if (data.expire_at) {
          const dateObj = new Date(data.expire_at);
          expireField.value = !isNaN(dateObj) ? dateObj.toISOString().split("T")[0] : "";
        } else {
          expireField.value = "";
        }

        categoryField.dispatchEvent(new Event("change"));

        setTimeout(() => {
          const subOptions = Array.from(subcategoryField.options).map(opt => opt.value);
          if (subOptions.includes(data.subcategory)) {
            subcategoryField.value = data.subcategory;
          } else if (data.subcategory) {
            const customOption = document.createElement("option");
            customOption.value = data.subcategory;
            customOption.textContent = data.subcategory;
            subcategoryField.appendChild(customOption);
            subcategoryField.value = data.subcategory;
          }
          subcategoryField.style.display = "block";
        }, 100);

        if (data.image) {
          imagePreview.src = `assets/images/products/${data.image}`;
          imagePreview.style.display = "block";
        } else {
          imagePreview.style.display = "none";
        }

        modal.style.display = "flex";
      })
      .catch(err => console.error("Gagal memuat data produk:", err));
  };

  window.deleteProduct = function(id) {
    Swal.fire({
      title: "Yakin ingin menghapus produk ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal"
    }).then(result => {
      if (result.isConfirmed) {
        fetch(`assets/php/master-produk.php?action=delete&id=${id}`)
          .then(() => {
            Swal.fire("Berhasil", "Produk berhasil dihapus.", "success");
            loadProducts();
          })
          .catch(err => {
            console.error("Gagal menghapus produk:", err);
            Swal.fire("Error", "Terjadi kesalahan saat menghapus produk.", "error");
          });
      }
    });
  };

  closeModalBtn.onclick = () => closeModal();

  function closeModal() {
    modal.style.display = "none";
    form.reset();
    imagePreview.style.display = "none";
    currentEditId = null;
  }

  window.addEventListener("click", e => {
    if (e.target === modal) {
      closeModal();
    }
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData();
    if (currentEditId) formData.append("id", currentEditId);
    formData.append("name", nameField.value);
    formData.append("price", priceField.value);
    formData.append("stock", stockField.value);
    formData.append("category", categoryField.value);
    formData.append("subcategory", subcategoryField.value);
    formData.append("expire_at", expireField.value);
    formData.append("description", descriptionField.value);
    if (imageField.files[0]) formData.append("image", imageField.files[0]);

    fetch("assets/php/master-produk.php?action=save", {
      method: "POST",
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        Swal.fire("Berhasil", "Produk berhasil disimpan.", "success");
        closeModal();
        loadProducts();
      } else {
        Swal.fire("Gagal", data.error || "Gagal menyimpan data.", "error");
      }
    })
    .catch(err => {
      console.error("Gagal menyimpan:", err);
      Swal.fire("Error", "Terjadi kesalahan saat menyimpan data.", "error");
    });
  });

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
          fetch("assets/php/logout.php")
            .then(() => {
              window.location.href = "Login.html";
            })
            .catch(err => {
              console.error("Gagal logout:", err);
              Swal.fire("Error", "Gagal logout. Silakan coba lagi.", "error");
            });
        }
      });
    });
  }

  loadProducts();
});