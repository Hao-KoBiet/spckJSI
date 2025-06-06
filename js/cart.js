document.addEventListener("DOMContentLoaded", function() {
    const cartList = document.getElementById("cartProductList");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function renderCart() {
        cartList.innerHTML = "";
        let total = 0;
        if (cart.length === 0) {
            cartList.innerHTML = "<p class='text-center'>Giỏ hàng trống.</p>";
            document.getElementById("cartTotalSection").innerHTML = "";
            return;
        }
        cart.forEach((item, idx) => {
            total += item.productPrice * item.quantity;
            const div = document.createElement("div");
            div.className = "cart-item col-md-4 mb-4";
            div.innerHTML = `
                <div class="card h-100 d-flex flex-column align-items-center justify-content-between" style="aspect-ratio: 1/1; min-width:220px;">
                    <img class="card-img-top" src="${item.img || '../assets/img/default.png'}" alt="Ảnh sản phẩm">
                    <div class="card-body w-100 d-flex flex-column align-items-center justify-content-center" style="height:100%;">
                        <h5 class="card-title text-center">${item.productName}</h5>
                        <p class="card-text text-danger text-center">Giá: ${item.productPrice.toLocaleString('vi-VN', {style:'currency', currency:'VND'})}</p>
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

        // Xử lý xóa
        document.querySelectorAll(".remove-btn").forEach(btn => {
            btn.onclick = function() {
                const idx = +btn.getAttribute("data-idx");
                cart.splice(idx, 1);
                localStorage.setItem("cart", JSON.stringify(cart));
                renderCart();
            };
        });

        // Xử lý chuyển sang trang chỉnh sửa
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.onclick = function() {
                const idx = +btn.getAttribute("data-idx");
                // Ưu tiên id, nếu không có thì dùng idx
                const item = cart[idx];
                let id = item.id || item.productId || idx;
                window.location.href = `../html/editProduct.html?id=${id}`;
            };
        });

        // Hiển thị tổng tiền và nút thanh toán
        document.getElementById("cartTotalSection").innerHTML = `
            <div class="cart-total-box">
                <span class="cart-total-label">Tổng tiền:</span>
                <span class="cart-total-value">${total.toLocaleString('vi-VN', {style:'currency', currency:'VND'})}</span>
                <button class="checkout-btn">Thanh toán</button>
            </div>
        `;
        document.querySelector(".checkout-btn").onclick = function() {
            const userAddress = localStorage.getItem('userAddress');
            if (userAddress == "Chưa cập nhật" || userAddress == null) {
                alert("Vui lòng cập nhật địa chỉ trước khi thanh toán!");
                window.location.href = "../html/profile.html";
                return; // Dừng xử lý tiếp theo nếu chưa cập nhật địa ch    
            } else {
            alert("Cảm ơn bạn đã mua hàng!");
            // Lưu sản phẩm đã mua
            let purchased = JSON.parse(localStorage.getItem('purchasedProducts') || '[]');
            cart.forEach(item => {
              // Chỉ lưu nếu chưa có
              if(!purchased.some(p => p.id == item.id)) {
                purchased.push({
                  id: item.id,
                  name: item.productName,
                  price: item.productPrice.toLocaleString('vi-VN', {style:'currency', currency:'VND'}),
                  image: item.img || '../assets/img/default.png'
                });
              }
            });
            localStorage.setItem('purchasedProducts', JSON.stringify(purchased));
            cart = [];
            localStorage.setItem("cart", JSON.stringify(cart));
            renderCart();
        }
        };
    }

    renderCart();
});