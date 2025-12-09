import React, { useState, useEffect, useMemo } from "react";
import TreatmentCard from "./TreatmentCard";
import "./style02.css";

const API_URL =
  "https://raw.githubusercontent.com/watermin-hub/1205_api_practice/main/beautrip_treatments_sample_2000.json";

const TreatmentList = () => {
  const [allTreatments, setAllTreatments] = useState([]);
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryLarge, setCategoryLarge] = useState("");
  const [categoryMid, setCategoryMid] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // 카테고리 옵션 생성
  const largeCategories = useMemo(() => {
    const categories = [
      ...new Set(allTreatments.map((t) => t.category_large).filter(Boolean)),
    ];
    return categories.sort();
  }, [allTreatments]);

  const midCategories = useMemo(() => {
    if (!categoryLarge) return [];
    const categories = [
      ...new Set(
        allTreatments
          .filter((t) => t.category_large === categoryLarge)
          .map((t) => t.category_mid)
          .filter(Boolean)
      ),
    ];
    return categories.sort();
  }, [allTreatments, categoryLarge]);

  // 데이터 로드
  useEffect(() => {
    const loadTreatments = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("API 요청 시작:", API_URL);

        const res = await fetch(API_URL);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        // 텍스트로 먼저 받아서 NaN을 null로 치환
        const text = await res.text();
        const cleanedText = text.replace(/:\s*NaN\s*([,}])/g, ": null$1");
        const data = JSON.parse(cleanedText);

        if (!Array.isArray(data)) {
          throw new Error("데이터 형식이 올바르지 않습니다. 배열이 아닙니다.");
        }

        setAllTreatments(data);
        setFilteredTreatments(data);
        console.log("시술 데이터 로드 완료:", data.length, "개");
      } catch (err) {
        console.error("데이터 로드 실패:", err);
        setError(err.message || "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadTreatments();
  }, []);

  // 대분류 변경 시 중분류 초기화
  useEffect(() => {
    setCategoryMid("");
  }, [categoryLarge]);

  // 필터 및 정렬 적용
  useEffect(() => {
    let filtered = [...allTreatments];

    // 검색 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (treatment) =>
          treatment.treatment_name?.toLowerCase().includes(term) ||
          treatment.hospital_name?.toLowerCase().includes(term) ||
          treatment.treatment_hashtags?.toLowerCase().includes(term)
      );
    }

    // 카테고리 필터
    if (categoryLarge) {
      filtered = filtered.filter(
        (treatment) => treatment.category_large === categoryLarge
      );
    }

    if (categoryMid) {
      filtered = filtered.filter(
        (treatment) => treatment.category_mid === categoryMid
      );
    }

    // 정렬
    if (sortBy === "price-low") {
      filtered.sort((a, b) => (a.selling_price || 0) - (b.selling_price || 0));
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => (b.selling_price || 0) - (a.selling_price || 0));
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "review") {
      filtered.sort(
        (a, b) => (b.review_count || 0) - (a.review_count || 0)
      );
    }

    setFilteredTreatments(filtered);
  }, [allTreatments, searchTerm, categoryLarge, categoryMid, sortBy]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <p style={{ fontSize: "18px", color: "#666", marginBottom: "12px" }}>
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
        <p style={{ fontSize: "14px", color: "#999", marginBottom: "20px" }}>
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 24px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <>
      <header>
        <div className="header-content">
          <h1>뷰트립</h1>
          <button
            className={`filter-toggle ${filtersOpen ? "active" : ""}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
            aria-label="필터 열기/닫기"
          >
            <span>필터</span>
          </button>
        </div>
        <div className={`filters ${filtersOpen ? "filters-open" : ""}`}>
          <input
            type="text"
            placeholder="시술명 / 병원명 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={categoryLarge}
            onChange={(e) => setCategoryLarge(e.target.value)}
          >
            <option value="">전체 카테고리</option>
            {largeCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={categoryMid}
            onChange={(e) => setCategoryMid(e.target.value)}
            disabled={!categoryLarge}
          >
            <option value="">중분류</option>
            {midCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">정렬</option>
            <option value="price-low">가격 낮은순</option>
            <option value="price-high">가격 높은순</option>
            <option value="rating">평점 높은순</option>
            <option value="review">리뷰 많은순</option>
          </select>
        </div>
      </header>
      <main>
        <section className="treatment-list">
          {filteredTreatments.length === 0 ? (
            <p style={{ textAlign: "center", padding: "20px" }}>
              검색 결과가 없습니다.
            </p>
          ) : (
            <>
              <div className="result-count">
                총 {filteredTreatments.length}개의 시술을 찾았습니다.
              </div>
              {filteredTreatments.map((treatment) => (
                <TreatmentCard key={treatment.treatment_id} treatment={treatment} />
              ))}
            </>
          )}
        </section>
      </main>
    </>
  );
};

export default TreatmentList;

