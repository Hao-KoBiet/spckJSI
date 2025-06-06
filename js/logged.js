import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { auth } from "./config.js"; // đảm bảo bạn đã export `auth` từ `config.js`

document.addEventListener("DOMContentLoaded", () => {
  const loginNavBtn = document.getElementById('login-button');
  if (!loginNavBtn) return;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginNavBtn.innerHTML = user.email || "Tài khoản";
      loginNavBtn.onclick = () => window.location.href = "../html/profile.html";
    } else {
      loginNavBtn.innerHTML = "Đăng nhập";
      if (location.href.endsWith('index.html')) {
        loginNavBtn.onclick = () => window.location.href = "./html/login.html";
      } else {
        loginNavBtn.onclick = () => window.location.href = "./login.html";
      }
    }
  });
});
