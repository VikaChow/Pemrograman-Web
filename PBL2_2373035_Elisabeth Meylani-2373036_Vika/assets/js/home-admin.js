// untuk mengambil data untuk dashboard
document.addEventListener("DOMContentLoaded", () => {
  fetch("assets/php/dashboard.php")
    .then(res => res.json())
    .then(data => {
      document.getElementById("totalProduk").textContent = data.total_produk || 0;
      document.getElementById("totalPesanan").textContent = data.total_pesanan || 0;
      document.getElementById("pesananPending").textContent = data.pending_pesanan || 0;

      const tbody = document.getElementById("recentOrdersBody");
      tbody.innerHTML = "";

      if (data.recent_orders && data.recent_orders.length > 0) {
        data.recent_orders.forEach(order => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>#ORD${order.order_id}</td>
            <td>${order.recipient_name}</td>
            <td>${order.status}</td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = `<tr><td colspan="3">Tidak ada pesanan terbaru.</td></tr>`;
      }
    })
    .catch(err => {
      console.error("Gagal memuat data dashboard:", err);
      alert("Gagal memuat data dashboard.");
    });
});

// untuk logout
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