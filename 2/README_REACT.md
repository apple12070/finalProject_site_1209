# 뷰트립 React 컴포넌트

기존 HTML/CSS/JavaScript 코드를 React 컴포넌트로 변환한 버전입니다.

## 파일 구조

```
├── App.jsx              # 루트 컴포넌트
├── TreatmentList.jsx    # 메인 시술 목록 컴포넌트 (필터, 검색, 정렬 포함)
├── TreatmentCard.jsx    # 개별 시술 카드 컴포넌트
├── utils.js             # 유틸리티 함수 (썸네일 URL 생성 등)
└── style02.css          # 기존 CSS 파일 (재사용)
```

## 사용 방법

### 1. React 프로젝트에 파일 추가

위 파일들을 React 프로젝트의 적절한 위치에 추가하세요.

### 2. 의존성 확인

React 16.8 이상 (Hooks 사용)이 필요합니다.

```bash
npm install react react-dom
```

### 3. 컴포넌트 사용

```jsx
import TreatmentList from './TreatmentList';

function App() {
  return <TreatmentList />;
}
```

또는

```jsx
import App from './App';

function Root() {
  return <App />;
}
```

## 주요 기능

- ✅ 시술 데이터 로드 및 표시
- ✅ 검색 기능 (시술명, 병원명, 해시태그)
- ✅ 카테고리 필터링 (대분류/중분류)
- ✅ 정렬 기능 (가격, 평점, 리뷰 수)
- ✅ 모바일 최적화 (필터 토글)
- ✅ 썸네일 이미지 표시 (API 이미지 또는 플레이스홀더)
- ✅ 반응형 디자인

## 상태 관리

- `useState`: 로컬 상태 관리
- `useEffect`: 데이터 로드 및 필터링
- `useMemo`: 카테고리 옵션 최적화

## 커스터마이징

### API URL 변경

`TreatmentList.jsx`의 `API_URL` 상수를 수정하세요.

### 스타일 변경

`style02.css` 파일을 수정하거나 CSS 모듈로 변환할 수 있습니다.

### 추가 기능

- 상태 관리 라이브러리 (Redux, Zustand 등) 추가 가능
- 라우팅 (React Router) 추가 가능
- 무한 스크롤 구현 가능
- 즐겨찾기 기능 추가 가능

## 주의사항

- API 응답에 `NaN` 값이 포함되어 있어 JSON 파싱 전에 처리합니다.
- 이미지 로드 실패 시 자동으로 플레이스홀더로 대체됩니다.
- 모바일에서 필터는 토글 버튼으로 접었다 펼칠 수 있습니다.

