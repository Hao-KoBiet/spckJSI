import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { db } from "./config.js";


// Hàm lấy id sản phẩm từ URL
function getProductId() {
    return new URLSearchParams(window.location.search).get("id");
}

// Hàm hiển thị chi tiết sản phẩm
async function showDetail() {
    const id = getProductId();
    if (!id) return;

    const snap = await getDoc(doc(db, "productList", id));
    const container = document.getElementById("productDetailContainer");
    if (!snap.exists()) {
        container.innerHTML = "Không tìm thấy sản phẩm!";
        return;
    }
    const p = snap.data();
    container.innerHTML = `
        <div class="detail-container">
            <div class="detail-img">
                <img src="${p.img}" alt="${p.productName}">
            </div>
            <div class="detail-info">
                <h2>${p.productName}</h2>
                <p class="price">Giá: ${p.productPrice?.toLocaleString('vi-VN', {style:'currency', currency:'VND'}) || ""}</p>
                <div class="action-group">
                    <label for="quantity">Số lượng:</label>
                    <div class="quantity-wrapper">
                        <button type="button" id="decrease-qty" class="qty-btn">-</button>
                        <input type="number" id="quantity" min="1" value="1">
                        <button type="button" id="increase-qty" class="qty-btn">+</button>
                    </div>
                    <button id="buy-btn" class="buy-btn">Mua ngay</button>
                    <button id="favorite-btn" class="favorite-btn">&#10084; Yêu thích</button>
                </div>
            </div>
        </div>
    `;

    // Xử lý nút tăng/giảm số lượng
    const qtyInput = document.getElementById("quantity");
    document.getElementById("decrease-qty").onclick = () => {
        let val = parseInt(qtyInput.value) || 1;
        if(val > 1) qtyInput.value = val - 1;
    };
    document.getElementById("increase-qty").onclick = () => {
        let val = parseInt(qtyInput.value) || 1;
        qtyInput.value = val + 1;
    };
    // Sau khi render xong:
    const buyBtn = document.getElementById("buy-btn");
    const favoriteBtn = document.getElementById("favorite-btn");
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
        buyBtn.disabled = true;
        buyBtn.textContent = "Đăng nhập để mua";
        buyBtn.style.opacity = "0.6";
        buyBtn.style.cursor = "not-allowed";
        buyBtn.onclick = function() {
            window.location.href = "../html/login.html";
        };
        favoriteBtn.disabled = true;
        favoriteBtn.textContent = "Đăng nhập để yêu thích";
        favoriteBtn.style.opacity = "0.6";
        favoriteBtn.style.cursor = "not-allowed";
        favoriteBtn.onclick = function() {
            window.location.href = "../html/login.html";
        };
    } else {
        buyBtn.disabled = false;
        buyBtn.textContent = "Mua ngay";
        buyBtn.style.opacity = "1";
        buyBtn.style.cursor = "pointer";
        favoriteBtn.disabled = false;
        favoriteBtn.textContent = "❤ Yêu thích";
        favoriteBtn.style.opacity = "1";
        favoriteBtn.style.cursor = "pointer";

        // Thêm sự kiện cho nút Mua ngay
        buyBtn.onclick = function() {
            const quantity = parseInt(document.getElementById("quantity").value) || 1;
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            // Kiểm tra sản phẩm đã có trong giỏ chưa
            const existingIndex = cart.findIndex(item => item.id === id);
            if (existingIndex !== -1) {
                cart[existingIndex].quantity += quantity;
            } else {
                cart.push({
                    id: id,
                    productName: p.productName,
                    productPrice: p.productPrice,
                    img: p.img,
                    quantity: quantity
                });
            }
            localStorage.setItem("cart", JSON.stringify(cart));
            window.location.href = "../html/cart.html";
        };
        favoriteBtn.onclick = function() {
            let favoriteProducts = JSON.parse(localStorage.getItem('favoriteProducts') || '[]');
            const productIndex = favoriteProducts.findIndex(item => item.id === id);
            if (productIndex !== -1) {
                // Remove from favorites
                favoriteProducts.splice(productIndex, 1);
                favoriteBtn.style = 'background: #fff; color: #000;'; // Default style
            } else {
                // Add to favorites
                favoriteProducts.push({ id: id, name: p.productName, price: p.productPrice.toLocaleString('vi-VN', {style:'currency', currency:'VND'}), image: p.img });
                favoriteBtn.style = 'background: #e74c3c; color: #fff;'; // Active style
            }
            localStorage.setItem('favoriteProducts', JSON.stringify(favoriteProducts));
        };
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const commentInput = document.getElementById("commentInput");
    const commentList = document.getElementById("commentList");
    const commentSubmit = document.getElementById("commentSubmit");

    commentSubmit.addEventListener("click", function () {
        const users = JSON.parse(localStorage.getItem('currentUser'));

        const comment = document.createElement('div');
        comment.style = "display: flex; align-items: center"
        comment.innerHTML = `
            <img src="https://sanctuarypocatello.com/wp-content/uploads/2023/09/blank-profile-300x300.png" style="width: 50px; height: 50px;" alt="Avatar">
            <div style="margin-left: 10px;">
                <h4 id="userComment">${users?.email || 'Ẩn danh'}</h4>
                <p id="commentContent">${commentInput.value}</p>
            </div>
        `;
        commentList.appendChild(comment);

        commentInput.value = '';
    });
});



showDetail();