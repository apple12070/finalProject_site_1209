import React, { useState } from "react";
import { getThumbnailUrl } from "./utils";

const TreatmentCard = ({ treatment }) => {
  const [imageError, setImageError] = useState(false);

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

  const thumbnailUrl = getThumbnailUrl(treatment);
  const fallbackUrl = getThumbnailUrl({
    category_large: treatment.category_large,
  });

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
    }
  };

  return (
    <article className="treatment-card">
      <div className="treatment-thumbnail">
        <img
          src={imageError ? fallbackUrl : thumbnailUrl}
          alt={treatment.treatment_name || "시술 이미지"}
          loading="lazy"
          onError={handleImageError}
        />
        {discountRate && (
          <div className="discount-overlay">{discountRate}</div>
        )}
      </div>

      <div className="treatment-content">
        <div className="treatment-header">
          <h3>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {treatment.treatment_name || "시술명 없음"}
            </a>
          </h3>
          <div className="hospital-name">
            {treatment.hospital_name || "병원명 없음"}
          </div>
        </div>

        <div className="treatment-category">
          {treatment.category_large && (
            <span className="category-badge">{treatment.category_large}</span>
          )}
          {treatment.category_mid && (
            <span className="category-badge">{treatment.category_mid}</span>
          )}
        </div>

        <div className="treatment-price">
          {treatment.original_price &&
            treatment.selling_price &&
            treatment.original_price > treatment.selling_price && (
              <div className="price-original">{originalPrice}</div>
            )}
          <div className="price-selling">{sellingPrice}</div>
          <div className="vat-info">{treatment.vat_info || ""}</div>
        </div>

        <div className="treatment-rating">
          {rating > 0 ? (
            <span className="rating">⭐ {rating.toFixed(1)}</span>
          ) : (
            <span className="rating">평점 없음</span>
          )}
          {reviewCount > 0 && (
            <span className="review-count">리뷰 {reviewCount}개</span>
          )}
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="treatment-link"
        >
          상세보기 →
        </a>
      </div>
    </article>
  );
};

export default TreatmentCard;

