import { doc, addDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { db } from "./config.js";

document.addEventListener("DOMContentLoaded", function () {
  const cartList = document.getElementById("cartProductList");
  let cart = [];

  async function renderCart() {
    const currentUserUID = localStorage.getItem("currentUserUID");
    if (!currentUserUID) {
      cartList.innerHTML = "<p class='text-center'>Vui lòng đăng nhập để xem giỏ hàng.</p>";
      document.getElementById("cartTotalSection").innerHTML = "";
      return;
    }

    const inCartRef = collection(db, "userList", currentUserUID, "inCartProducts");
    const snapshot = await getDocs(inCartRef);
    cart = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      data._docId = doc.id; // để sau này xóa dễ
      cart.push(data);
    });

    cartList.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      cartList.innerHTML = "<p class='text-center'>Giỏ hàng trống.</p>";
      document.getElementById("cartTotalSection").innerHTML = "";
      return;
    }

    cart.forEach((item, idx) => {
      total += item.price * item.quantity;
      const div = document.createElement("div");
      div.className = "cart-item col-md-4 mb-4";
      div.innerHTML = `
        <div class="card h-100 d-flex flex-column align-items-center justify-content-between" style="aspect-ratio: 1/1; min-width:220px;">
          <img class="card-img-top" src="${item.image || '../assets/img/default.png'}" alt="Ảnh sản phẩm">
          <div class="card-body w-100 d-flex flex-column align-items-center justify-content-center" style="height:100%;">
            <h5 class="card-title text-center">${item.name}</h5>
            <p class="card-text text-danger text-center">Giá: ${item.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
            <div class="d-flex align-items-center mb-2">
              <label style="margin-right:6px;">Số lượng:</label>
              <span class="cart-quantity">${item.quantity}</span>
            </div>
            <div class="w-100 d-flex justify-content-around mb-3">
              <button class="edit-btn" data-idx="${idx}">Chỉnh sửa</button>
              <button class="remove-btn" data-idx="${idx}">Xóa</button>
            </div>
          </div>
        </div>
      `;
      cartList.appendChild(div);
    });

    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.onclick = async function () {
        const idx = +btn.getAttribute("data-idx");
        const item = cart[idx];
        const docId = item._docId;
        await deleteDoc(doc(db, "userList", currentUserUID, "inCartProducts", docId));
        renderCart();
      };
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.onclick = function () {
        const idx = +btn.getAttribute("data-idx");
        const item = cart[idx];
        const id = item.id || item.productId || idx;
        window.location.href = `../html/editProduct.html?id=${id}`;
      };
    });

    document.getElementById("cartTotalSection").innerHTML = `
      <div class="cart-total-box">
        <span class="cart-total-label">Tổng tiền:</span>
        <span class="cart-total-value">${total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
        <button class="checkout-btn">Thanh toán</button>
      </div>
    `;

    document.querySelector(".checkout-btn").onclick = async function () {
      const userAddress = localStorage.getItem('userAddress');
      if (!userAddress || userAddress === "Chưa cập nhật") {
        alert("Vui lòng cập nhật địa chỉ trước khi thanh toán!");
        window.location.href = "../html/profile.html";
        return;
      }

      alert("Cảm ơn bạn đã mua hàng!");

      // Ghi vào Firestore - purchasedProducts
      const purchasedRef = collection(db, "userList", currentUserUID, "purchasedProducts");

      for (const item of cart) {
        await addDoc(purchasedRef, {
          id: item.id,
          name: item.name,
          price: item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
          image: item.image || '../assets/img/default.png',
          quantity: item.quantity
        });

        // Xoá từng item khỏi inCartProducts
        if (item._docId) {
          console.log(item._docId)
          await deleteDoc(doc(db, "userList", currentUserUID, "inCartProducts", item._docId));
        }
      }

      renderCart();
    };
  }

  renderCart();
});
