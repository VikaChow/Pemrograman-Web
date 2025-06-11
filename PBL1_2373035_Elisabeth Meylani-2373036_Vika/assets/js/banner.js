document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#productTable tbody");

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

        document.querySelectorAll(".delete-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            deleteBanner(id);
          });
        });

        document.querySelectorAll(".edit-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            showEditForm(id);
          });
        });
      })
      .catch(err => {
        console.error("Gagal memuat banner:", err);
      });
  }

  function deleteBanner(id) {
    if (!confirm("Yakin ingin menghapus banner ini?")) return;
    fetch(`assets/php/banner.php?action=delete&id=${id}`)
      .then(res => res.text())
      .then(result => {
        if (result.trim() === "deleted") {
          alert("Banner berhasil dihapus.");
          loadBanners();
        } else {
          alert("Gagal menghapus banner.");
        }
      })
      .catch(err => {
        console.error("Error saat menghapus banner:", err);
      });
  }

  function showEditForm(id) {
    const editForm = document.createElement("form");
    editForm.setAttribute("enctype", "multipart/form-data");
    editForm.innerHTML = `
      <h4>Edit Banner</h4>
      <input type="file" name="image" accept="image/*" required />
      <button type="submit">Update</button>
      <button type="button" id="cancelEdit">Batal</button>
    `;
    document.querySelector(".container").prepend(editForm);

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
            alert("Banner berhasil diupdate!");
            editForm.remove();
            loadBanners();
          } else {
            alert("Gagal mengupdate banner: " + result);
          }
        })
        .catch(err => {
          console.error("Error saat update banner:", err);
        });
    });
  }

  // Upload form
  const uploadForm = document.createElement("form");
  uploadForm.setAttribute("enctype", "multipart/form-data");
  uploadForm.innerHTML = `
    <input type="file" id="bannerImage" name="image" accept="image/*" required />
    <button type="submit">Tambah Banner</button>
  `;
  document.querySelector(".container").prepend(uploadForm);

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
          alert("Banner berhasil diupload!");
          uploadForm.reset();
          loadBanners();
        } else {
          alert("Gagal mengunggah banner: " + result);
        }
      })
      .catch(err => {
        console.error("Error saat upload banner:", err);
      });
  });

  loadBanners();
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