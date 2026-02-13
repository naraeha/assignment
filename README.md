# 스마트 농장 실시간 관제 대시보드

## 설치 및 실행
bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev


## 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:
```
VITE_API_BASE_URL=<API_서버_URL>
VITE_WS_BASE_URL=<WebSocket_서버_URL>
```

## 로그인 계정

- 이메일: `test22@example.com`

## 구현 설명

### 상태 관리
- **Zustand**: 로그인 토큰 전역 관리, localStorage 동기화
- **useState**: 페이지별 로컬 상태 (로딩, 데이터, 에러)

### WebSocket 처리
- `useWebSocket` 커스텀 훅으로 재사용

### 다국어 (i18n)
- i18next + react-i18next
- 한국어/영어 JSON 파일로 관리

## 기술 스택

- React + TypeScript + Vite
- React Router, Zustand, Axios, Recharts
- i18next

## 폴더 구조
```
src/
├── api/          # API 호출
├── pages/        # 페이지 컴포넌트
├── hooks/        # 커스텀 훅
├── store/        # Zustand 스토어
└── locales/      # 다국어 파일
```
