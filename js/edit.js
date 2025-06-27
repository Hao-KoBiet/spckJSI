import {
    doc,
    getDocs,
    updateDoc,
    collection
  } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
  import { db } from "./config.js";
  
  document.addEventListener("DOMContentLoaded", async function () {
    // Lấy id sản phẩm từ URL
    function getProductId() {
      return new URLSearchParams(window.location.search).get("id");
    }
  
    const id = getProductId();
    const uid = localStorage.getItem("currentUserUID");
  
    if (!id || !uid) {
      alert("Không tìm thấy sản phẩm hoặc người dùng!");
      window.location.href = "../html/cart.html";
      return;
    }
  
    const inCartRef = collection(db, "userList", uid, "inCartProducts");
    const snapshot = await getDocs(inCartRef);
  
    let docId = null;
    let product = null;
  
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.id == id || data.productId == id) {
        docId = docSnap.id;
        product = data;
      }
    });
  
    if (!product) {
      alert("Sản phẩm không tồn tại trong giỏ hàng!");
      window.location.href = "../html/cart.html";
      return;
    }
  
    // Gán dữ liệu lên HTML
    document.getElementById("productName").textContent = product.name || "";
    document.getElementById("productPrice").textContent = (product.price || 0).toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
    document.getElementById("quantity").value = product.quantity || 1;
    document.getElementById("productImg").src = product.image || "../assets/img/default.png";
  
    // Cập nhật tổng giá
    function updateTotalPrice() {
      const qty = parseInt(document.getElementById("quantity").value) || 1;
      const price = product.price || 0;
      document.getElementById("totalPrice").textContent = (qty * price).toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND'
      });
    }
  
    updateTotalPrice(); // Gọi lần đầu
    document.getElementById("quantity").addEventListener("input", updateTotalPrice);
  
    // Xử lý lưu
    document.getElementById("saveBtn").onclick = async function () {
      const newQty = parseInt(document.getElementById("quantity").value) || 1;
  
      try {
        await updateDoc(doc(db, "userList", uid, "inCartProducts", docId), {
          quantity: newQty
        });
        alert("Đã lưu số lượng mới!");
        window.location.href = "../html/cart.html";
      } catch (err) {
        console.error("Lỗi khi cập nhật sản phẩm:", err);
        alert("Cập nhật thất bại!");
      }
    };
  });
  