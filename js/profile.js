import { auth } from "./config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

// Hiển thị thông tin người dùng
function showProfile(user) {
    document.getElementById("profile-name").textContent = localStorage.getItem('fullName') || "Chưa cập nhật";
    document.getElementById("profile-email").textContent = user.email || "";
}

// Lấy thông tin từ localStorage (nếu có)
const localUser = localStorage.getItem("currentUser");
if (localUser) {
    const user = JSON.parse(localUser);
    showProfile(user);
}

// Ưu tiên lấy thông tin từ Firebase Auth nếu đã đăng nhập
onAuthStateChanged(auth, (user) => {
    if (user) {
        showProfile(user);
    } else {
        // Nếu chưa đăng nhập, chuyển về trang đăng nhập
        window.location.href = "./login.html";
    }
});

// Hiển thị sản phẩm yêu thích và đã mua
function renderProducts(listId, storageKey) {
    const container = document.getElementById(listId);
    if (!container) return;
    const products = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (products.length === 0) {
        container.innerHTML = '<div style="color:#888;">Chưa có sản phẩm nào.</div>';
        return;
    }
    container.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}">
            <div class="product-name">${p.name}</div>
            <div class="product-price">${p.price}</div>
        </div>
    `).join("");
}
document.addEventListener('DOMContentLoaded', function() {
  renderProducts('favorites-list', 'favoriteProducts');
  renderProducts('purchased-list', 'purchasedProducts');
});
document.addEventListener("DOMContentLoaded", function() {
    const changeAddressBtn = document.getElementById("changeAddressBtn");
    const addressDisplay = document.getElementById("address-display");
    const storedAddress = localStorage.getItem("userAddress");

    if (storedAddress) {
        addressDisplay.innerText = storedAddress;
    }

    if (changeAddressBtn && addressDisplay) {
        changeAddressBtn.addEventListener("click", function() {
            const newAddress = prompt("Nhập địa chỉ mới:", addressDisplay.innerText);
            if (newAddress) {
                addressDisplay.innerText = newAddress;
                localStorage.setItem("userAddress", newAddress);
            }
        });
    }
});

const logoutBtn = document.getElementById("logout-button");
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}
function logout() {
    auth.signOut().then(() => {
        alert("Đã đăng xuất thành công!");
        localStorage.clear()
        location.href = "./login.html";
    }).catch((error) => {
        alert("Lỗi khi đăng xuất: " + error.message);
    });
}