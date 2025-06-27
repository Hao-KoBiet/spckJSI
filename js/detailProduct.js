import {
  doc,
  getDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { db } from "./config.js";

function getProductId() {
  return new URLSearchParams(window.location.search).get("id");
}

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
        <p class="price">Giá: ${
          p.productPrice?.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          }) || ""
        }</p>
        <form id="ratingForm" style="display: flex; gap: 10px">
          <div class="star-rating">
            <input type="radio" id="star5" name="rating" value="5"><label for="star5">★</label>
            <input type="radio" id="star4" name="rating" value="4"><label for="star4">★</label>
            <input type="radio" id="star3" name="rating" value="3"><label for="star3">★</label>
            <input type="radio" id="star2" name="rating" value="2"><label for="star2">★</label>
            <input type="radio" id="star1" name="rating" value="1"><label for="star1">★</label>
          </div>
          <p id="average-rating" style="margin-top: 10px; font-weight: bold; font-size: 12px"></p>
        </form>
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

  const qtyInput = document.getElementById("quantity");
  document.getElementById("decrease-qty").onclick = () => {
    let val = parseInt(qtyInput.value) || 1;
    if (val > 1) qtyInput.value = val - 1;
  };
  document.getElementById("increase-qty").onclick = () => {
    let val = parseInt(qtyInput.value) || 1;
    qtyInput.value = val + 1;
  };

  const buyBtn = document.getElementById("buy-btn");
  const favoriteBtn = document.getElementById("favorite-btn");
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    [buyBtn, favoriteBtn].forEach((btn) => {
      btn.disabled = true;
      btn.style.opacity = "0.6";
      btn.style.cursor = "not-allowed";
    });
    buyBtn.textContent = "Đăng nhập để mua";
    favoriteBtn.textContent = "Đăng nhập để yêu thích";
    [buyBtn, favoriteBtn].forEach((btn) => {
      btn.onclick = () => (window.location.href = "../html/login.html");
    });
  } else {
    [buyBtn, favoriteBtn].forEach((btn) => {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    });
    buyBtn.textContent = "Mua ngay";
    favoriteBtn.textContent = "❤ Yêu thích";

    const currentUserUID = localStorage.getItem("currentUserUID");
    const parentDocRef = doc(db, "userList", currentUserUID);

    const favoriteSubColRef = collection(parentDocRef, "favoritedProducts");
    const favoriteQuery = query(favoriteSubColRef, where("id", "==", id));

    const inCartColRef = collection(parentDocRef, "inCartProducts");
    const inCartQuery = query(inCartColRef, where("id", "==", id));

    buyBtn.onclick = async function () {
      const quantity = parseInt(document.getElementById("quantity").value) || 1;
      const inCartSnapshot = await getDocs(inCartQuery);

      if (!inCartSnapshot.empty) {
        for (const docSnap of inCartSnapshot.docs) {
          await deleteDoc(docSnap.ref);
        }
        window.location.href = "cart.html";
      } else {
        await addDoc(inCartColRef, {
          id: id,
          name: p.productName,
          price: p.productPrice,
          image: p.img,
          quantity: quantity,
          purchasedAt: new Date(),
        });
        window.location.href = "cart.html";
      }
    };

    favoriteBtn.onclick = async function () {
      const favoriteSnapshot = await getDocs(favoriteQuery);

      if (!favoriteSnapshot.empty) {
        for (const docSnap of favoriteSnapshot.docs) {
          await deleteDoc(docSnap.ref);
        }
        favoriteBtn.style = "background: #fff; color: #e74c3c;";
      } else {
        await addDoc(favoriteSubColRef, {
          id: id,
          name: p.productName,
          price: p.productPrice,
          image: p.img,
        });
        favoriteBtn.style = "background: #e74c3c; color: #fff;";
      }
    };
  }
}

// Load bình luận
let allComments = []; // để dùng lại cho thu gọn

async function loadComments() {
  const id = new URLSearchParams(window.location.search).get("id");

  const commentColRef = collection(db, "productList", id, "comments");
  const snapshot = await getDocs(commentColRef);

  allComments = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    allComments.push({ ...data, _docId: doc.id });
  });

  allComments.sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);
  if (allComments.length === 0) {
    document.getElementById("commentList").innerHTML =
      "<p>Không có bình luận nào<p>";
    return;
  }

  renderInitialComments();
}

function renderInitialComments() {
  const commentList = document.getElementById("commentList");
  const showMoreBtn = document.getElementById("showMoreBtn");

  commentList.innerHTML = "";

  const firstThree = allComments.slice(0, 3);
  const remaining = allComments.slice(3);

  firstThree.forEach((comment) => renderComment(commentList, comment));

  if (remaining.length > 0) {
    showMoreBtn.style.display = "block";
    showMoreBtn.textContent = "Xem thêm bình luận";

    showMoreBtn.onclick = () => {
      renderRemainingComments();
    };
  } else {
    showMoreBtn.style.display = "none";
  }
}

function renderRemainingComments() {
  const commentList = document.getElementById("commentList");
  const showMoreBtn = document.getElementById("showMoreBtn");

  const remaining = allComments.slice(3);
  remaining.forEach((comment) => renderComment(commentList, comment));

  showMoreBtn.textContent = "Thu gọn bình luận";

  showMoreBtn.onclick = () => {
    renderInitialComments();
  };
}

async function renderComment(container, comment) {
  const id = new URLSearchParams(window.location.search).get("id");
  const productDocRef = doc(db, "productList", id);
  const ratingsRef = collection(productDocRef, "ratings");
  const q = query(ratingsRef, where("userEmail", "==", comment.user)) || "";
  const existingRatings = await getDocs(q);
  const userRating = existingRatings.docs[0]?.data()?.rating || 0;
  let userRated = "";
  for(let i = 0; i < 5; i++) {
    if(i < userRating) {
      userRated += "⭐";
    } else {
      userRated += "☆";
    }
  }

  const commentDiv = document.createElement("div");
  commentDiv.style.width = "100%";
  commentDiv.innerHTML = `
    <div style="display: flex; align-items: flex-start; margin-bottom: 10px; background: #f9f9f9; padding: 10px; border-radius: 8px; max-width: 700px; width:100%">
      <img src="https://sanctuarypocatello.com/wp-content/uploads/2023/09/blank-profile-300x300.png"
        style="width: 50px; height: 50px; border-radius: 50%;" alt="Avatar">
      <div id="commentBlog" style="margin-left: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style= "background-color:#FEFEFE">
            <strong>${comment.user || "Ẩn danh"}</strong>
            <p style="margin: 0; font-size: 12px; color: #888;">
              ${comment.createdAt?.toDate().toLocaleString() || ""}
            </p>
          </div>
          <div>
            ${userRated}
          </div>
        </div>
        <p style="margin-top: 5px; overflow-wrap: break-word; white-space: normal; word-break: break-word">${comment.content}</p>
      </div>
    </div>
  `;
  container.appendChild(commentDiv);
}

// Gửi bình luận
document.addEventListener("DOMContentLoaded", function () {
  const commentInput = document.getElementById("commentInput");
  const commentSubmit = document.getElementById("commentSubmit");
  const id = new URLSearchParams(window.location.search).get("id");
  const productDocRef = doc(db, "productList", id);
  const commentSubColRef = collection(productDocRef, "comments");

  commentSubmit?.addEventListener("click", async function () {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const userEmail = currentUser?.email || "Ẩn danh";
    const content = commentInput.value.trim();

    if (!content) return;

    await addDoc(commentSubColRef, {
      user: userEmail,
      content: content,
      createdAt: new Date(),
    });

    commentInput.value = "";
    loadComments();
  });
});

async function showStars() {
  const id = getProductId();
  const ratingInputs = document.querySelectorAll('input[name="rating"]');
  const avgDiv = document.getElementById("average-rating");

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userEmail = currentUser?.email;
  let hasRated = false;

  if (!userEmail) {
    alert("Bạn cần đăng nhập để đánh giá.");
    return;
  }

  // Tạo collection ratings nếu chưa có và kiểm tra đánh giá
  const productDocRef = doc(db, "productList", id);
  const ratingsRef = collection(productDocRef, "ratings");
  const q = query(ratingsRef, where("userEmail", "==", userEmail));
  const existingRatings = await getDocs(q);

  if (!existingRatings.empty) {
    const previousRating = existingRatings.docs[0].data().rating;
    alert(`Bạn đã đánh giá ${previousRating} sao trước đó.`);
    const star = document.getElementById('star' + previousRating);
    if (star) star.checked = true;
    hasRated = true;

    // Thêm nút đánh giá lại
    const form = document.getElementById("ratingForm");
    const retryBtn = document.createElement("button");
    retryBtn.textContent = "Đánh giá lại";
    retryBtn.type = "button";
    retryBtn.id = "retry-rating-btn";
    form.appendChild(retryBtn);

    retryBtn.addEventListener("click", async () => {
      if (confirm("Bạn có chắc muốn đánh giá lại?")) {
        for (const docSnap of existingRatings.docs) {
          await deleteDoc(docSnap.ref);
        }
        location.reload();
      }
    });
  }

  if (!hasRated) {
    ratingInputs.forEach(input => {
      input.addEventListener('change', async function () {
        const selectedRating = parseInt(this.value);
        localStorage.setItem('userRating', selectedRating);
        alert(`Bạn đã đánh giá ${selectedRating} sao`);

        try {
          await addDoc(ratingsRef, {
            userEmail: userEmail,
            rating: selectedRating,
            timestamp: new Date()
          });
          location.reload();
        } catch (error) {
          console.error("Lỗi khi lưu đánh giá:", error);
        }
      });
    });
  }

  const allRatings = await getDocs(ratingsRef);
  let total = 0;
  allRatings.forEach(doc => {
    total += doc.data().rating;
  });

  const avg = (allRatings.size > 0) ? (total / allRatings.size).toFixed(1) : "Chưa có đánh giá";
  avgDiv.innerHTML = `<p style="color: gray; font-size: 20px;">${avg}⭐ (${allRatings.size} lượt)</p>`;
}


document.addEventListener("DOMContentLoaded", async function () {
  await showDetail();      // render sản phẩm và các sao đánh giá
  showStars();             // gắn logic đánh giá sau khi đã render xong sao
  loadComments();          // bình luận
});
