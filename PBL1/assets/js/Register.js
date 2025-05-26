document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form["confirm-password"].value;

    // Validasi dasar
    if (password.length < 6) {
      alert("Kata sandi harus minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    // Ambil array users dari localStorage, atau buat baru kalau belum ada
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Cek email sudah terdaftar?
    const isEmailRegistered = users.some(user => user.email === email);
    if (isEmailRegistered) {
      alert("Email sudah terdaftar. Silakan login.");
      return;
    }

    // Tambahkan user baru
    users.push({ name, email, password });

    // Simpan kembali ke localStorage
    localStorage.setItem("users", JSON.stringify(users));

    alert("Pendaftaran berhasil! Silakan login.");
    window.location.href = "/login.html";
  });
});