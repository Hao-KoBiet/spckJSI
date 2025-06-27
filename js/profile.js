import { auth, db } from "./config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import {
  getDocs,
  getDoc,
  collection,
  query,
  where,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

// Hiển thị thông tin người dùng
function showProfile(user) {
  document.getElementById("profile-email").textContent = user.email || "";
  const storedName = localStorage.getItem("fullName");
  if (storedName) {
    document.getElementById("profile-name").textContent = storedName;
  }
}

// Lấy name từ Firestore
async function fetchUserNameFromFirestore(email) {
  try {
    const q = query(collection(db, "userList"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      document.getElementById("profile-role").textContent = `Tên: ${
        userData.name || "Chưa cập nhật"
      }`;
      document.getElementById("profile-name").textContent = `Vai trò: ${
        userData.role || "Chưa cập nhật"
      }`;
      document.getElementById("profile-address").textContent = `${
        userData.address || "Chưa cập nhật"
      } `;
    } else {
      console.log("Không tìm thấy user trong Firestore.");
    }
  } catch (error) {
    console.error("Lỗi khi lấy tên từ Firestore:", error);
  }
}

// Khi đã đăng nhập thì gọi cả showProfile và fetchUserName
onAuthStateChanged(auth, (user) => {
  if (user) {
    showProfile(user);
    fetchUserNameFromFirestore(user.email);
  } else {
    window.location.href = "./login.html";
  }
});

// Hiển thị sản phẩm yêu thích và đã mua
async function renderProducts() {
  const currentUserUID = localStorage.getItem("currentUserUID");
  if (!currentUserUID) return;
  const parentDocRef = doc(db, "userList", currentUserUID);
  const purchasedRef = collection(parentDocRef, "purchasedProducts");
  try {
    const querySnapshot = await getDocs(purchasedRef);
    const purchasedProducts = [];
    querySnapshot.forEach((docSnap) => {
      purchasedProducts.push(docSnap.data());
    });
    displayPurchased(purchasedProducts);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm đã mua:", error);
  }

  const favoritesRef = collection(parentDocRef, "favoritedProducts");
  try {
    const querySnapshot = await getDocs(favoritesRef);
    const favoriteProducts = [];

    querySnapshot.forEach((docSnap) => {
      favoriteProducts.push(docSnap.data());
    });

    console.log("Sản phẩm yêu thích:", favoriteProducts);

    // 👉 Duyệt qua để hiển thị
    displayFavorites(favoriteProducts);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm yêu thích:", error);
  }
}

function displayPurchased(products) {
  const container = document.getElementById("purchased-list");
  if (!container) return;

  container.innerHTML = "";
  if (products.length === 0) {
    container.innerHTML = "<p>Bạn chưa yêu thích sản phẩm nào.</p>";
    return;
  }

  products.forEach((p) => {
    const item = document.createElement("div");
    item.className = "product";
    item.innerHTML = `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}">
            <div class="product-name">${p.name}</div>
            <div class="product-price">${p.price}</div>
        </div>
      `;
    container.appendChild(item);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderProducts();
});
function displayFavorites(products) {
  const container = document.getElementById("favorited-list");
  if (!container) return;

  container.innerHTML = "";
  if (products.length === 0) {
    container.innerHTML = "<p>Bạn chưa yêu thích sản phẩm nào.</p>";
    return;
  }

  products.forEach((p) => {
    const item = document.createElement("div");
    item.className = "product";
    item.innerHTML = `
      <div class="product-card">
          <img src="${p.image}" alt="${p.name}">
          <div class="product-name">${p.name}</div>
          <div class="product-price">${p.price}</div>
      </div>
    `;
    container.appendChild(item);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderProducts();
});

document.addEventListener("DOMContentLoaded", async function () {
  const changeAddressBtn = document.getElementById("changeAddressBtn");
  const addressDisplay = document.getElementById("profile-address");

  const currentUserUID = localStorage.getItem("currentUserUID");
  if (!currentUserUID) return;

  const parentDocRef = doc(db, "userList", currentUserUID);

  const snap = await getDoc(parentDocRef);
  const storedAddress = snap.exists() ? snap.data().address : "Chưa có địa chỉ";
  // addressDisplay.innerText = storedAddress;

  changeAddressBtn.addEventListener("click", async function () {
    const newAddress = prompt("Nhập địa chỉ mới:");
    if (newAddress && newAddress.trim() !== "") {
      addressDisplay.innerText = newAddress;
      await updateDoc(parentDocRef, {
        address: newAddress,
      });
    }
  });
});


// Đăng xuất
const logoutBtn = document.getElementById("logout-button");
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}
function logout() {
  signOut(auth)
    .then(() => {
      alert("Đã đăng xuất thành công!");
      localStorage.clear();
      location.href = "./login.html";
    })
    .catch((error) => {
      alert("Lỗi khi đăng xuất: " + error.message);
    });
}
