import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { auth, db } from "./config.js";


const register = document.getElementById("registerForm");
if (register) {
  register.addEventListener("submit", async function (e) {
    e.preventDefault();
    let notifyRegister = document.querySelector("#notifyRegister");
    let fullName = document.querySelector("#name-user")?.value.trim() || "";
    let email = document.querySelector("#email").value.trim();
    let password = document.querySelector("#password").value.trim();
    let confirmPassword = document.querySelector("#confirm-user")?.value.trim() || "";

    if (password !== confirmPassword) {
      if (notifyRegister) notifyRegister.innerHTML = `<p class="text-danger">Mật khẩu không khớp</p>`;
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      localStorage.setItem("fullName", fullName);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      location.href = "login.html";
    } catch (error) {
      if (notifyRegister) notifyRegister.innerHTML = `<p class="text-danger">${error.message}</p>`;
    }
  });
}

const login = document.getElementById("loginForm");
if (login) {
  login.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      localStorage.setItem("currentUser", JSON.stringify({
        email: user.email,
        fullName: user.fullName || ""
      }));
      alert("Logged in successfully!");
      location.href = "../index.html";
    } catch (error) {
      alert("Error logging in: " + error.message);
    }
  });
}

async function loadCategoriesFromFirestore() {
  const querySnapshot = await getDocs(collection(db, "productList"));
  const categoriesSet = new Set();
  querySnapshot.forEach((doc) => {
    const product = doc.data();
    if (product.category) categoriesSet.add(product.category);
  });
  const categories = Array.from(categoriesSet);
  const container = document.getElementById('category-buttons');
  if (!container) return;
  container.innerHTML = '<button class="btn btn-success m-1" data-category="all">Tất cả</button>' +
    categories.map(cat => `<button class="btn btn-outline-success m-1" data-category="${cat}">${cat}</button>`).join('');
  container.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      filterProducts(e.target.getAttribute('data-category'));
    }
  });
}

let allProducts = [];

function filterProducts(category) {
  const productContainer = document.getElementById('productContainer');
  const productElements = document.querySelectorAll('.products');

  productElements.forEach(el => {
    const productCategory = el.getAttribute('data-category');
    const match = category === 'all' || productCategory === category;
    el.classList.toggle('hidden', !match);
  });

  productContainer.append(productContainer);
}

async function displayProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, "productList"));
    allProducts = [];
    const productContainer = document.getElementById('productContainer');
    if (!productContainer) return;

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      product.id = doc.id;
      allProducts.push(product);

      const productElement = document.createElement('div');
      productElement.className = 'products col-6 col-sm-4 col-md-3 col-lg-2 d-flex justify-content-center align-items-center product-gap';
      productElement.setAttribute('data-category', product.category);
      productElement.innerHTML = `
        <div class="product-square product-item">
          <img src="${product.img}" alt="${product.productName}" class="img-fluid mb-2" style="max-width: 100px; max-height: 100px; object-fit: contain;">
          <p class="mb-1">${product.productName}</p>
          <p class="mb-0" style="color: red">${product.productPrice.toLocaleString('vi-VN', {style : 'currency', currency : 'VND'})}</p>
        </div>
      `;
      productElement.onclick = () => {
        window.location.href = `../html/detailProduct.html?id=${product.id}`;
      };
      productContainer.appendChild(productElement);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

function getSearchParam() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('search')?.trim().toLowerCase() || '';
}

if (window.location.pathname.endsWith('shop.html')) {
  await loadCategoriesFromFirestore();
  await displayProducts();

  const searchQuery = getSearchParam();
  const input = document.getElementById("search-input");
  if (input) input.value = searchQuery;
  findProducts(searchQuery);
}

const provider = new GoogleAuthProvider();
const googleBtn = document.getElementById("google-login-btn");
if (googleBtn) {
  googleBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        alert("Đăng nhập với Google thành công!");
        location.href = "../index.html";
      })
      .catch((error) => {
        alert("Lỗi khi đăng nhập: " + error.message);
      });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const loginNavBtn = document.getElementById('login-button');
  if (!loginNavBtn) return;
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginNavBtn.innerHTML = user.email || "Tài khoản";
      loginNavBtn.onclick = () => window.location.href = "./html/profile.html";
    } else {
      loginNavBtn.innerHTML = "Đăng nhập";
      if (location.href.endsWith('index.html')){
        loginNavBtn.onclick = () => window.location.href = "./html/login.html";
      } else {
      loginNavBtn.onclick = () => window.location.href = "./login.html";
      }
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("search-input");

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const query = searchInput.value.trim().toLowerCase();
      if ( location.href.endsWith('index.html')) {
        window.location.href = `html/shop.html${query ? `?search=${encodeURIComponent(query)}` : ''}`;
      } else {
        window.location.href = `shop.html${query ? `?search=${encodeURIComponent(query)}` : ''}`;
      }
    });
  }
});

function findProducts(query) {
  const productElements = document.querySelectorAll('.products');
  const productContainer = document.getElementById('productContainer');

  const normalizedQuery = query.trim().toLowerCase();
  let found = false;

  const oldMessage = document.querySelector('.no-result-message');
  if (oldMessage) oldMessage.remove();

  if (!normalizedQuery) {
    productElements.forEach(el => el.classList.remove('hidden'));
    return;
  }

  productElements.forEach(el => {
    const name = el.querySelector('p').textContent.toLowerCase();
    if (name.includes(normalizedQuery)) {
      el.classList.remove('hidden');
      found = true;
    } else {
      el.classList.add('hidden');
    }
  });

  if (!found && productContainer) {
    productContainer.insertAdjacentHTML('beforeend', `<p class="no-result-message">Không tìm thấy sản phẩm nào.</p>`);
  }
}
