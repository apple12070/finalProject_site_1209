// 뷰트립 시술 데이터 로드 & 렌더링
const API_URL =
  "https://raw.githubusercontent.com/watermin-hub/1205_api_practice/main/beautrip_treatments_sample_2000.json";

let allTreatments = [];
let filteredTreatments = [];

// 시술 데이터 로드
async function loadTreatments() {
  try {
    console.log("API 요청 시작:", API_URL);
    const res = await fetch(API_URL);

    // 응답 상태 확인
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // 텍스트로 먼저 받아서 NaN을 null로 치환
    const text = await res.text();
    // NaN 값을 null로 치환 (JSON에서 유효하지 않은 NaN 처리)
    const cleanedText = text.replace(/:\s*NaN\s*([,}])/g, ": null$1");

    const data = JSON.parse(cleanedText);

    // 데이터가 배열인지 확인
    if (!Array.isArray(data)) {
      throw new Error("데이터 형식이 올바르지 않습니다. 배열이 아닙니다.");
    }

    allTreatments = data;
    filteredTreatments = [...allTreatments];
    console.log("시술 데이터 로드 완료:", allTreatments.length, "개");

    // 카테고리 옵션 생성
    setupCategoryFilters();

    // 초기 렌더링
    renderTreatments(filteredTreatments);

    // 이벤트 리스너 설정
    setupEventListeners();
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    const errorMessage = error.message || "알 수 없는 오류가 발생했습니다.";
    document.getElementById("treatmentList").innerHTML = `
      <div style='text-align: center; padding: 40px 20px;'>
        <p style='font-size: 18px; color: #666; margin-bottom: 12px;'>데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p style='font-size: 14px; color: #999; margin-bottom: 20px;'>${errorMessage}</p>
        <button onclick="location.reload()" style='padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;'>다시 시도</button>
      </div>
    `;
  }
}

// 카테고리 필터 설정
function setupCategoryFilters() {
  const categoryLargeSelect = document.getElementById("categoryLargeSelect");
  const categoryMidSelect = document.getElementById("categoryMidSelect");

  // 대분류 카테고리 추출
  const largeCategories = [
    ...new Set(allTreatments.map((t) => t.category_large).filter(Boolean)),
  ];
  largeCategories.sort();

  largeCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryLargeSelect.appendChild(option);
  });

  // 대분류 변경 시 중분류 업데이트
  categoryLargeSelect.addEventListener("change", (e) => {
    const selectedLarge = e.target.value;
    categoryMidSelect.innerHTML = '<option value="">중분류</option>';

    if (selectedLarge) {
      const midCategories = [
        ...new Set(
          allTreatments
            .filter((t) => t.category_large === selectedLarge)
            .map((t) => t.category_mid)
            .filter(Boolean)
        ),
      ];
      midCategories.sort();

      midCategories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryMidSelect.appendChild(option);
      });
    }

    applyFilters();
  });

  categoryMidSelect.addEventListener("change", () => applyFilters());
}

// 썸네일 URL 생성 함수
function getThumbnailUrl(treatment) {
  // API에서 제공하는 main_image_url이 있으면 우선 사용
  if (treatment.main_image_url && treatment.main_image_url.trim() !== "") {
    return treatment.main_image_url;
  }

  // main_image_url이 없을 경우 고유한 플레이스홀더 생성
  const categoryColors = {
    리프팅: "667eea",
    피부: "f093fb",
    눈: "4facfe",
    코: "43e97b",
    입술: "fa709a",
    볼: "fee140",
    쁘띠: "30cfd0",
    기타: "a8edea",
  };

  const category = treatment.category_large || "기타";
  const color = categoryColors[category] || "667eea";

  // treatment_id를 기반으로 고유한 이미지 생성 (다양한 패턴)
  const treatmentId = treatment.treatment_id || Math.random() * 1000;
  const pattern = Math.floor(treatmentId % 4); // 0-3 패턴

  // 시술명의 첫 글자를 사용하여 더 다양하게
  const firstChar = treatment.treatment_name
    ? treatment.treatment_name.charAt(0)
    : category.charAt(0);

  // 다양한 그라데이션 방향과 색상 조합
  const gradients = [
    `linear-gradient(135deg, #${color} 0%, #${color}dd 100%)`,
    `linear-gradient(45deg, #${color} 0%, #${color}aa 100%)`,
    `linear-gradient(225deg, #${color} 0%, #${color}cc 100%)`,
    `linear-gradient(315deg, #${color} 0%, #${color}bb 100%)`,
  ];

  // Unsplash API를 사용한 랜덤 이미지 (카테고리 기반)
  // 또는 더 다양한 플레이스홀더 서비스 사용
  const seed = treatmentId % 1000; // 0-999 범위로 제한

  // 다양한 플레이스홀더 서비스 사용
  const placeholderServices = [
    `https://picsum.photos/seed/${seed}${treatmentId}/400/300`,
    `https://via.placeholder.com/400x300/${color}/ffffff?text=${encodeURIComponent(
      firstChar
    )}`,
  ];

  // treatment_id 기반으로 서비스 선택
  return placeholderServices[treatmentId % placeholderServices.length];
}

// 이벤트 리스너 설정
function setupEventListeners() {
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const filterToggle = document.getElementById("filterToggle");
  const filtersContainer = document.getElementById("filtersContainer");

  searchInput.addEventListener("input", () => applyFilters());
  sortSelect.addEventListener("change", () => applyFilters());

  // 모바일 필터 토글
  if (filterToggle) {
    filterToggle.addEventListener("click", () => {
      filtersContainer.classList.toggle("filters-open");
      filterToggle.classList.toggle("active");
    });
  }
}

// 필터 및 정렬 적용
function applyFilters() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const categoryLarge = document.getElementById("categoryLargeSelect").value;
  const categoryMid = document.getElementById("categoryMidSelect").value;
  const sortBy = document.getElementById("sortSelect").value;

  filteredTreatments = allTreatments.filter((treatment) => {
    const matchesSearch =
      !searchTerm ||
      treatment.treatment_name?.toLowerCase().includes(searchTerm) ||
      treatment.hospital_name?.toLowerCase().includes(searchTerm) ||
      treatment.treatment_hashtags?.toLowerCase().includes(searchTerm);

    const matchesLargeCategory =
      !categoryLarge || treatment.category_large === categoryLarge;
    const matchesMidCategory =
      !categoryMid || treatment.category_mid === categoryMid;

    return matchesSearch && matchesLargeCategory && matchesMidCategory;
  });

  // 정렬 적용
  if (sortBy === "price-low") {
    filteredTreatments.sort(
      (a, b) => (a.selling_price || 0) - (b.selling_price || 0)
    );
  } else if (sortBy === "price-high") {
    filteredTreatments.sort(
      (a, b) => (b.selling_price || 0) - (a.selling_price || 0)
    );
  } else if (sortBy === "rating") {
    filteredTreatments.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === "review") {
    filteredTreatments.sort(
      (a, b) => (b.review_count || 0) - (a.review_count || 0)
    );
  }

  renderTreatments(filteredTreatments);
}

// 시술 목록 렌더링
function renderTreatments(treatments) {
  const listEl = document.getElementById("treatmentList");

  if (treatments.length === 0) {
    listEl.innerHTML =
      "<p style='text-align: center; padding: 20px;'>검색 결과가 없습니다.</p>";
    return;
  }

  listEl.innerHTML = "";

  treatments.forEach((treatment) => {
    const card = document.createElement("article");
    card.className = "treatment-card";

    const url = treatment.event_url || "#";
    const originalPrice = treatment.original_price
      ? new Intl.NumberFormat("ko-KR").format(treatment.original_price) + "원"
      : "-";
    const sellingPrice = treatment.selling_price
      ? new Intl.NumberFormat("ko-KR").format(treatment.selling_price) + "원"
      : "-";
    const discountRate = treatment.dis_rate ? `${treatment.dis_rate}%` : "";
    const rating = treatment.rating || 0;
    const reviewCount = treatment.review_count || 0;

    // 썸네일 이미지 생성 (API의 main_image_url 우선 사용)
    const thumbnailUrl = getThumbnailUrl(treatment);
    // 이미지 로드 실패 시 대체 이미지
    const fallbackUrl = getThumbnailUrl({
      category_large: treatment.category_large,
    });

    card.innerHTML = `
      <div class="treatment-thumbnail">
        <img 
          src="${thumbnailUrl}" 
          alt="${treatment.treatment_name || "시술 이미지"}" 
          loading="lazy"
          onerror="this.onerror=null; this.src='${fallbackUrl}';"
        />
        ${
          discountRate
            ? `<div class="discount-overlay">${discountRate}</div>`
            : ""
        }
      </div>
      
      <div class="treatment-content">
        <div class="treatment-header">
          <h3>
            <a href="${url}" target="_blank" rel="noopener noreferrer">
              ${treatment.treatment_name || "시술명 없음"}
            </a>
          </h3>
          <div class="hospital-name">${
            treatment.hospital_name || "병원명 없음"
          }</div>
        </div>
        
        <div class="treatment-category">
          <span class="category-badge">${treatment.category_large || ""}</span>
          <span class="category-badge">${treatment.category_mid || ""}</span>
        </div>
        
        <div class="treatment-price">
          ${
            treatment.original_price &&
            treatment.selling_price &&
            treatment.original_price > treatment.selling_price
              ? `<div class="price-original">${originalPrice}</div>`
              : ""
          }
          <div class="price-selling">
            ${sellingPrice}
          </div>
          <div class="vat-info">${treatment.vat_info || ""}</div>
        </div>
        
        <div class="treatment-rating">
          ${
            rating > 0
              ? `<span class="rating">⭐ ${rating.toFixed(1)}</span>`
              : '<span class="rating">평점 없음</span>'
          }
          ${
            reviewCount > 0
              ? `<span class="review-count">리뷰 ${reviewCount}개</span>`
              : ""
          }
        </div>
        
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="treatment-link">
          상세보기 →
        </a>
      </div>
    `;

    listEl.appendChild(card);
  });

  // 결과 개수 표시
  const resultCount = document.createElement("div");
  resultCount.className = "result-count";
  resultCount.textContent = `총 ${treatments.length}개의 시술을 찾았습니다.`;
  listEl.insertBefore(resultCount, listEl.firstChild);
}

// 페이지 로드 시 데이터 로드
loadTreatments();
