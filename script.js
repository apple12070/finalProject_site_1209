//  7. Firebase 연동
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// Firebase Auth
import {
  getAuth,
  GithubAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase Firestore
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Storage
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2EvCz8zSIvS3YYH22agalG1sMpTQbfPI",
  authDomain: "finalproject-api-251209-36b14.firebaseapp.com",
  projectId: "finalproject-api-251209-36b14",
  storageBucket: "finalproject-api-251209-36b14.firebasestorage.app",
  messagingSenderId: "549153175662",
  appId: "1:549153175662:web:7cdcb6412fddf9cce3ce7f",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GithubAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const chatBox = document.getElementById("chatBox");

loginBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider);
});

logoutBtn.addEventListener("click", () => {
  signOut(auth).catch(console.error);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    userInfo.textContent = `로그인 사용자: ${user.displayName || user.email}`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    chatBox.style.display = "block";
  } else {
    userInfo.textContent = "로그인하지 않았습니다.";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    chatBox.style.display = "none";
  }
});

// ===== 8. Firebase Chat =====
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

const messagesRef = collection(db, "messages");
const qMessages = query(messagesRef, orderBy("created_at", "asc"));
onSnapshot(qMessages, (snapshot) => {
  chatMessages.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    let html = `<strong>${data.user_name}</strong>: ${data.text || ""}`;
    if (data.imageUrl) {
      html += `<br /><img src="${data.imageUrl}" alt="image" style="max-width:200px; border-radius:8px; margin-top:4px;" />`;
    }
    li.innerHTML = html;
    chatMessages.appendChild(li);
  });
});
const chatImageInput = document.getElementById("chatImage");
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) {
    alert("먼저 GitHub로 로그인 해주세요.");
    return;
  }
  const text = chatInput.value;
  const file = chatImageInput.files[0];
  if (!text.trim() && !file) {
    return;
  }
  let imageUrl = null;
  try {
    if (file) {
      const filePath = `chatImages/${user.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }
    await addDoc(messagesRef, {
      user_id: user.uid,
      user_name: user.displayName || user.email,
      text,
      imageUrl,
      created_at: serverTimestamp(),
    });
    chatInput.value = "";
    chatImageInput.value = "";
  } catch (err) {
    console.error("채팅 저장 오류:", err);
    alert("메시지를 전송하는 중 오류가 발생했습니다.");
  }
});

// 1. 책 데이터 로드 & 렌더링
const BOOKS_JSON_URL =
  "https://raw.githubusercontent.com/apple12070/finalProject_api_1210/refs/heads/main/books_yes24.json";

const GOODS_JSON_URL =
  "https://raw.githubusercontent.com/apple12070/finalProject_api_1210/refs/heads/main/goods_yes24.json";

// 우리는 api 많아서 객체 형태로 끌어와야 함!!!!!!
// const API_URL = {
//   api1:"",
//   api1:"",
//   api1:"",
//   api1:"",
// }

// 지난 수업!
// let allBooks = [];
// async function loadBooks() {
//   const res = await fetch(API_URL);
//   allBooks = await res.json();
//   // 이거 비동기처리라서 url찾기도 전에 json 변환할 수도 있어서 await 꼭 적어줘야 함
//   console.log(allBooks);
//   // 이 함수가 allBooks 값을 출력함
//   renderBooks(allBooks);
// }

// ===== 1. 책 & 굿즈 데이터 로드 & 렌더링 =====
let booksData = [];
let goodsData = [];

// booksData & goodsData
const categoryGoodsMap = {
  국내도서_경제경영: "학습/독서",
  국내도서_IT: "디지털",
  국내도서_자기계발: "디자인문구",
};

async function loadAllData() {
  const [books, goods] = await Promise.all([
    fetch(BOOKS_JSON_URL),
    fetch(GOODS_JSON_URL),
  ]);

  booksData = await books.json();
  goodsData = await goods.json();

  populateCategoryDropdown();

  renderBooks(booksData);
}

// 2. 브라우저 스캔 후 데이터 로드 및 렌더링 실행
window.addEventListener("load", loadAllData);

// 3. 카테고리 드롭다운 생성

function populateCategoryDropdown() {
  const categorySelect = document.getElementById("categorySelect");
  categorySelect.innerHTML = "";
  const categories = [
    ...new Set(booksData.map((b) => b.category).filter(Boolean)),
  ];
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

// 4. 책 목록 렌더링 - API 활용 생성
function renderBooks(books) {
  const listEl = document.getElementById("bookList");
  listEl.innerHTML = "";
  books.forEach((book) => {
    const card = document.createElement("article");
    card.className = "book-card";
    const url = book.detail_url || "#";
    card.innerHTML = `
      <a href="${url}" target="_blank" rel="noopener noreferrer">
        <img src="${book.thumb || ""}" alt="${book.title || ""}" />
      </a>
      <h3>
        <a href="${url}" target="_blank" rel="noopener noreferrer">
          ${book.title || "제목 없음"}
        </a>
      </h3>
      <p class="meta">${book.author || "저자 미상"} | ${
      book.publisher || ""
    }</p>
      <p class="meta">정가: ${book.list_price || "-"} / 판매가: ${
      book.sale_price || "-"
    }</p>
      <p class="meta">카테고리: ${book.category || ""} | 재고: ${
      book.stock || ""
    }</p>
      <button type="button">댓글 보기</button>
    `;
    const btn = card.querySelector("button");
    btn.addEventListener("click", () => openCommentSection(book));
    listEl.appendChild(card);
  });
}

// 실질적으로 카테고리가 적용되게 만드는 함수
// 5. 책 검색 & 필터 함수
function applyFilters() {
  const qRaw = document.getElementById("searchInput").value; // 검색어
  const q = qRaw.trim().toLowerCase(); // 검색어 정규화
  const cat = document.getElementById("categorySelect").value; // 카테고리
  const filtered = booksData.filter((book) => {
    const inCategory = !cat || cat === "all" ? true : book.category === cat; // 카테고리 필터링
    const text = `${book.title || ""} ${book.author || ""} ${
      book.publisher || ""
    }`.toLowerCase(); // 검색어 필터링
    const inSearch = q ? text.includes(q) : true; // 검색어 필터링
    return inCategory && inSearch;
  });
  renderBooks(filtered);

  // 굿즈 검색 및 렌더링
  if (q) {
    renderRelatedGoods(q, filtered);
  } else {
    const goodsContainer = document.getElementById("relatedGoods");
    if (goodsContainer) goodsContainer.innerHTML = "";
  }
}

// ===== 10. 검색어 기반 연관 굿즈 출력 =====

function renderRelatedGoods(keyword, filteredBooks) {
  const container = document.getElementById("relatedGoods");
  if (!container) return;
  container.innerHTML = "";
  if (filteredBooks.length === 0) return;
  const bookCategories = Array.from(
    new Set(filteredBooks.map((b) => b.category))
  );
  bookCategories.forEach((bookCat) => {
    const goodsCat = categoryGoodsMap[bookCat];
    if (!goodsCat) return;
    let related = goodsData.filter(
      (item) =>
        item.category === goodsCat &&
        keyword &&
        item.title &&
        item.title.toLowerCase().includes(keyword.toLowerCase())
    );
    if (related.length === 0) {
      related = goodsData.filter((item) => item.category === goodsCat);
    }
    related = related.slice(0, 10);
    if (related.length === 0) return;
    const section = document.createElement("section");
    section.className = "goods-section";
    section.innerHTML = `
      <h3>${bookCat} 검색("${keyword}") 관련 굿즈 – ${goodsCat} 추천</h3>
    `;
    const list = document.createElement("div");
    list.className = "goods-list";
    related.forEach((item) => {
      const card = document.createElement("article");
      card.className = "goods-card";
      card.innerHTML = `
        <a href="${item.detail_url}" target="_blank" rel="noopener noreferrer">
          <img src="${item.thumbnail || ""}" alt="${item.title || ""}" />
          <p class="goods-title">${item.title || ""}</p>
          ${
            item.price
              ? `<p class="goods-price">${item.price.toLocaleString()}원</p>`
              : ""
          }
        </a>
      `;
      list.appendChild(card);
    });
    section.appendChild(list);
    container.appendChild(section);
  });
}

// 6. 책 검색 필터 실제 적용
document.getElementById("searchInput").addEventListener("input", applyFilters);
document
  .getElementById("categorySelect")
  .addEventListener("change", applyFilters);

// 9. 카메라 열기 / 캡처 / 닫기
const cameraButton = document.getElementById("cameraButton");
const cameraArea = document.getElementById("cameraArea");
const cameraPreview = document.getElementById("cameraPreview");
const captureButton = document.getElementById("captureButton");
const closeCameraButton = document.getElementById("closeCameraButton");

// 카메라 켜기
let cameraStream = null;
cameraButton.addEventListener("click", async () => {
  try {
    if (cameraStream) {
      cameraArea.classList.remove("hidden");
      return;
    }
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraPreview.srcObject = cameraStream;
    cameraArea.classList.remove("hidden");
  } catch (err) {
    console.error("카메라 접근 실패:", err);
    alert("카메라를 사용할 수 없습니다. 브라우저 권한을 확인해주세요.");
  }
});

// 카메라 끄기
function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  cameraArea.classList.add("hidden");
}
closeCameraButton.addEventListener("click", stopCamera);

// 캡처(카메라 촬영) 기능
captureButton.addEventListener("click", () => {
  if (!cameraStream) return;
  const user = auth.currentUser;
  if (!user) {
    alert("먼저 GitHub로 로그인 해주세요.");
    return;
  }
  const track = cameraStream.getVideoTracks()[0];
  const settings = track.getSettings();
  const width = settings.width || 640;
  const height = settings.height || 480;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(cameraPreview, 0, 0, width, height);
  canvas.toBlob(
    async (blob) => {
      if (!blob) return;
      try {
        const filePath = `chatImages/${user.uid}/${Date.now()}_camera.jpg`;
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, blob);
        const imageUrl = await getDownloadURL(storageRef);
        const text = chatInput.value;
        await addDoc(messagesRef, {
          user_id: user.uid,
          user_name: user.displayName || user.email,
          text,
          imageUrl,
          created_at: serverTimestamp(),
        });
        chatInput.value = "";
        stopCamera(); // 촬영 후 카메라 닫기
      } catch (err) {
        console.error("촬영 이미지 전송 오류:", err);
        alert("사진을 전송하는 중 오류가 발생했습니다.");
      }
    },
    "image/jpeg",
    0.9
  );
});
