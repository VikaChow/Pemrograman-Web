document.addEventListener("DOMContentLoaded", function () {
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  let pesananData = []; // Simpan semua data agar search dan sort bekerja di seluruh data

  const tbody = document.querySelector("#productTable tbody");

  // Render tabel
  function renderTable(data) {
    tbody.innerHTML = "";
    data.forEach((pesanan, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#ORD${pesanan.order_id}</td>
        <td>${pesanan.recipient_name}</td>
        <td>${pesanan.products.join(", ")}</td>
        <td>Rp${pesanan.total_price}</td>
        <td>
          <select class="status-dropdown" data-order-id="${pesanan.order_id}" data-index="${index}">
            <option value="pending" ${pesanan.status.toLowerCase() === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="paid" ${pesanan.status.toLowerCase() === 'paid' ? 'selected' : ''}>Paid</option>
            <option value="cancelled" ${pesanan.status.toLowerCase() === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            <option value="shipped" ${pesanan.status.toLowerCase() === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="completed" ${pesanan.status.toLowerCase() === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td><button class="btn-detail" data-index="${index}">Detail</button></td>
      `;
      tbody.appendChild(tr);
    });

    bindEvents(); // Bind event detail dan status lagi
  }

  // Ambil data dari server
  fetch("assets/php/get-pesanan.php")
    .then(response => response.json())
    .then(response => {
      if (response.success && Array.isArray(response.data)) {
        pesananData = response.data;
        renderTable(pesananData);
      } else {
        console.error("Gagal memuat data:", response.message);
      }
    })
    .catch(error => console.error("Gagal mengambil data:", error));

  // Bind tombol detail dan status
  function bindEvents() {
    document.querySelectorAll(".btn-detail").forEach(btn => {
      btn.addEventListener("click", function () {
        const index = this.getAttribute("data-index");
        const pesanan = pesananData[index];

        document.getElementById("modal-order-id").textContent = `#ORD${pesanan.order_id}`;
        document.getElementById("modal-name").textContent = pesanan.recipient_name;
        document.getElementById("modal-address").textContent = pesanan.address;
        document.getElementById("modal-total").textContent = `Rp${pesanan.total_price}`;
        document.getElementById("modal-status").textContent = capitalize(pesanan.status);
        document.getElementById("modal-date").textContent = pesanan.created_at;

        const ul = document.getElementById("modal-products");
        ul.innerHTML = "";
        pesanan.products.forEach(p => {
          const li = document.createElement("li");
          li.textContent = p;
          ul.appendChild(li);
        });

        document.getElementById("detailModal").classList.remove("hidden");
      });
    });

    document.querySelectorAll(".status-dropdown").forEach(dropdown => {
      dropdown.addEventListener("change", function () {
        const orderId = this.dataset.orderId;
        const index = this.dataset.index;
        const newStatus = this.value;

        fetch('assets/php/update-status.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `order_id=${orderId}&status=${newStatus}`
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Status pesanan berhasil diperbarui.',
                timer: 1500,
                showConfirmButton: false
              });
              pesananData[index].status = newStatus;
              if (!document.getElementById("detailModal").classList.contains("hidden")) {
                document.getElementById("modal-status").textContent = capitalize(newStatus);
              }
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: 'Tidak dapat memperbarui status pesanan.'
              });
            }
          })
          .catch(err => {
            console.error('Fetch gagal:', err);
            alert('Terjadi kesalahan saat memperbarui status.');
          });
      });
    });
  }

  // Search
  document.getElementById("searchInput").addEventListener("input", function () {
    const keyword = this.value.toLowerCase();
    const filtered = pesananData.filter(p => 
      p.order_id.toString().includes(keyword) ||
      p.recipient_name.toLowerCase().includes(keyword) ||
      p.products.join(", ").toLowerCase().includes(keyword) ||
      p.status.toLowerCase().includes(keyword)
    );
    renderTable(filtered);
  });

  // Sort
  document.querySelectorAll("th.sortable").forEach(header => {
    header.addEventListener("click", () => {
      const col = header.dataset.col;
      const rows = Array.from(tbody.querySelectorAll("tr"));
      const index = Array.from(header.parentNode.children).indexOf(header);

      const isNumber = col === "total_price" || col === "order_id";

      let sortOrder = header.dataset.sorted === "asc" ? "desc" : "asc";
      header.dataset.sorted = sortOrder;

      // Reset header lain
      document.querySelectorAll("th.sortable").forEach(h => {
        if (h !== header) h.dataset.sorted = "";
      });

      const sortedRows = rows.sort((a, b) => {
        let aText = a.children[index].innerText.replace(/[^\w\s.,-]/g, "").trim();
        let bText = b.children[index].innerText.replace(/[^\w\s.,-]/g, "").trim();

        if (isNumber) {
          aText = parseFloat(aText.replace(/[^\d.-]/g, '')) || 0;
          bText = parseFloat(bText.replace(/[^\d.-]/g, '')) || 0;
          return aText - bText;
        } else {
          return aText.localeCompare(bText);
        }
      });

      if (sortOrder === "desc") {
        sortedRows.reverse();
      }

      tbody.innerHTML = "";
      sortedRows.forEach(row => tbody.appendChild(row));
    });
  });

  // Modal close
  const closeBtn = document.querySelector(".close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("detailModal").classList.add("hidden");
    });
  }

  window.addEventListener("click", (e) => {
    const modal = document.getElementById("detailModal");
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      Swal.fire({
        title: "Yakin ingin logout?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, logout",
        cancelButtonText: "Batal"
      }).then(result => {
        if (result.isConfirmed) {
          fetch('assets/php/logout.php')
            .then(() => {
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
});