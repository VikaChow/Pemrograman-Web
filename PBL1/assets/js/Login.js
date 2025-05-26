document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-form");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      alert("Harap isi email dan password.");
      return;
    }

    // Ambil daftar user dari localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Cari user yang cocok
    const matchedUser = users.find(user => user.email === email && user.password === password);

    if (matchedUser) {
      alert("Login berhasil!");
      // Simpan data user yang sedang login
      localStorage.setItem("user", JSON.stringify({
        name: matchedUser.name,
        email: matchedUser.email
      }));
      window.location.href = "/Home.html";
    } else {
      alert("Email atau password salah!");
    }
  });
});