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