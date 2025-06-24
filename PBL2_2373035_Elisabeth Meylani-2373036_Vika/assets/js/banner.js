document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#productTable tbody");

  // untuk mengambil data banner
  function loadBanners() {
    fetch("assets/php/banner.php?action=get")
      .then(res => res.json())
      .then(data => {
        tableBody.innerHTML = "";
        data.forEach(banner => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td><img src="assets/images/banner/${banner.image}" width="100" /></td>
            <td>
              <button class="edit-btn" data-id="${banner.id}">Edit</button>
              <button class="delete-btn" data-id="${banner.id}">Hapus</button>
            </td>
          `;
          tableBody.appendChild(row);
        });

        // tombol menghapus banner
        document.querySelectorAll(".delete-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            deleteBanner(id);
          });
        });

        // tombol mengedit banner
        document.querySelectorAll(".edit-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            showEditForm(id);
          });
        });
      })
      .catch(err => {
        console.error("Gagal memuat banner:", err);
        Swal.fire("Error", "Gagal memuat banner.", "error");
      });
  }

  // untuk menghapus banner
  function deleteBanner(id) {
    Swal.fire({
      title: "Yakin ingin menghapus banner ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal"
    }).then(result => {
      if (result.isConfirmed) {
        fetch(`assets/php/banner.php?action=delete&id=${id}`)
          .then(res => res.text())
          .then(result => {
            if (result.trim() === "deleted") {
              Swal.fire("Berhasil", "Banner berhasil dihapus.", "success");
              loadBanners();
            } else {
              Swal.fire("Gagal", "Gagal menghapus banner.", "error");
            }
          })
          .catch(err => {
            console.error("Error saat menghapus banner:", err);
            Swal.fire("Error", "Terjadi kesalahan saat menghapus banner.", "error");
          });
      }
    });
  }

  // untuk mengedit banner
  function showEditForm(id) {
    const editForm = document.createElement("form");
    editForm.classList.add("edit-banner-form");
    editForm.setAttribute("enctype", "multipart/form-data");
    editForm.innerHTML = `
      <h4>Edit Banner</h4>
      <input type="file" name="image" accept="image/*" required />
      <button type="submit">Update</button>
      <button type="button" id="cancelEdit">Batal</button>
    `;
    document.querySelector(".button-left").appendChild(editForm);

    document.getElementById("cancelEdit").addEventListener("click", () => {
      editForm.remove();
    });

    editForm.addEventListener("submit", e => {
      e.preventDefault();
      const formData = new FormData(editForm);

      fetch(`assets/php/banner.php?action=update&id=${id}`, {
        method: "POST",
        body: formData
      })
        .then(res => res.text())
        .then(result => {
          if (result.trim() === "updated") {
            Swal.fire("Berhasil", "Banner berhasil diupdate!", "success");
            editForm.remove();
            loadBanners();
          } else {
            Swal.fire("Gagal", "Gagal mengupdate banner: " + result, "error");
          }
        })
        .catch(err => {
          console.error("Error saat update banner:", err);
          Swal.fire("Error", "Terjadi kesalahan saat update banner.", "error");
        });
    });
  }

  // untuk tambah banner
  const buttonLeft = document.createElement("div");
  buttonLeft.classList.add("button-left");
  buttonLeft.style.marginBottom = "1rem";
  document.querySelector(".container").prepend(buttonLeft);

  const uploadForm = document.createElement("form");
  uploadForm.setAttribute("enctype", "multipart/form-data");
  uploadForm.classList.add("upload-banner-form");
  uploadForm.innerHTML = `
    <input type="file" id="bannerImage" name="image" accept="image/*" required />
    <button type="submit">Tambah Banner</button>
  `;
  buttonLeft.appendChild(uploadForm);

  uploadForm.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(uploadForm);

    fetch("assets/php/banner.php?action=save", {
      method: "POST",
      body: formData
    })
      .then(res => res.text())
      .then(result => {
        if (result.trim() === "success") {
          Swal.fire("Berhasil", "Banner berhasil diupload!", "success");
          uploadForm.reset();
          loadBanners();
        } else {
          Swal.fire("Gagal", "Gagal mengunggah banner: " + result, "error");
        }
      })
      .catch(err => {
        console.error("Error saat upload banner:", err);
        Swal.fire("Error", "Terjadi kesalahan saat upload banner.", "error");
      });
  });

  loadBanners();
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