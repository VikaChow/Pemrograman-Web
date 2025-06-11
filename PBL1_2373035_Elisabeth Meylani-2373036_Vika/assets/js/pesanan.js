document.addEventListener("DOMContentLoaded", function () {
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  fetch("assets/php/get-pesanan.php")
    .then(response => response.json())
    .then(response => {
      if (response.success && Array.isArray(response.data)) {
        const tbody = document.querySelector("#productTable tbody");

        response.data.sort((a, b) => a.order_id - b.order_id);

        response.data.forEach((pesanan, index) => {
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

        // Event tombol Detail
        document.querySelectorAll(".btn-detail").forEach(btn => {
          btn.addEventListener("click", function () {
            const index = this.getAttribute("data-index");
            const pesanan = response.data[index];

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

        // Event Ubah Status
        document.querySelectorAll(".status-dropdown").forEach(dropdown => {
          dropdown.addEventListener("change", function () {
            const orderId = this.dataset.orderId;
            const index = this.dataset.index;
            const newStatus = this.value;

            fetch('assets/php/update-status.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
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
                  const modal = document.getElementById("detailModal");

                  // Update data lokal agar tetap konsisten
                  response.data[index].status = newStatus;

                  // Jika modal sedang terbuka, update juga statusnya di modal
                  if (!modal.classList.contains("hidden")) {
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
      } else {
        console.error("Gagal memuat data:", response.message);
      }
    })
    .catch(error => console.error("Gagal mengambil data:", error));

  // Event close modal
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

  // Event logout
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
});