// 썸네일 URL 생성 함수
export const getThumbnailUrl = (treatment) => {
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

  // treatment_id를 기반으로 고유한 이미지 생성
  const treatmentId = treatment.treatment_id || Math.random() * 1000;
  const seed = treatmentId % 1000; // 0-999 범위로 제한

  // 시술명의 첫 글자를 사용하여 더 다양하게
  const firstChar = treatment.treatment_name
    ? treatment.treatment_name.charAt(0)
    : category.charAt(0);

  // 다양한 플레이스홀더 서비스 사용
  const placeholderServices = [
    `https://picsum.photos/seed/${seed}${treatmentId}/400/300`,
    `https://via.placeholder.com/400x300/${color}/ffffff?text=${encodeURIComponent(
      firstChar
    )}`,
  ];

  // treatment_id 기반으로 서비스 선택
  return placeholderServices[treatmentId % placeholderServices.length];
};

