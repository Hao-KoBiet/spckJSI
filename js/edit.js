document.addEventListener("DOMContentLoaded", function() {
    // Lấy id sản phẩm từ URL
    function getProductId() {
        return new URLSearchParams(window.location.search).get("id");
    }

    const id = getProductId();
    if (!id) {
        alert("Không tìm thấy sản phẩm cần chỉnh sửa!");
        window.location.href = "../html/cart.html";
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const idx = cart.findIndex(item => item.productId == id || item.id == id);
    if (idx === -1) {
        alert("Sản phẩm không tồn tại trong giỏ hàng!");
        window.location.href = "../html/cart.html";
        return;
    }
    // Lấy thông tin sản phẩm
    const product = cart[idx];

    // Gán dữ liệu lên form
    document.getElementById("productName").textContent = product.productName || "";
    document.getElementById("productBrand").textContent = product.productBrand || "";
    document.getElementById("productPrice").textContent = (product.productPrice || 0).toLocaleString('vi-VN', {style:'currency', currency:'VND'});
    document.getElementById("quantity").textContent = product.quantity || 1;
    document.getElementById("productImg").src = product.img || "../assets/img/default.png";
    document.getElementById("totalPrice").textContent = ((product.productPrice || 0) * (product.quantity || 1)).toLocaleString('vi-VN', {style:'currency', currency:'VND'});

    // Ẩn các trường không cần thiết
    document.getElementById("productName").setAttribute("readonly", true);
    document.getElementById("productBrand").setAttribute("readonly", true);
    document.getElementById("productPrice").setAttribute("readonly", true);

    // Hiển thị tổng giá ban đầu
    function updateTotalPrice() {
        const price = product.productPrice || 0;
        const qty = parseInt(document.getElementById("quantity").value) || 1;
        document.getElementById("totalPrice").textContent = (price * qty).toLocaleString('vi-VN', {style:'currency', currency:'VND'});
    }
    updateTotalPrice();

    // Cập nhật tổng giá khi thay đổi số lượng
    document.getElementById("quantity").addEventListener("input", updateTotalPrice);

    // Xử lý lưu thay đổi (chỉ cập nhật số lượng)
    document.getElementById("saveBtn").onclick = function() {
        const newQty = parseInt(document.getElementById("quantity").value) || 1;
        cart[idx].quantity = newQty;
        localStorage.setItem("cart", JSON.stringify(cart));
        alert("Đã lưu số lượng mới!");
        window.location.href = "../html/cart.html";
    };
});