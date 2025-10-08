# 페이지 API 응답 데이터 구조 문서

## 📋 개요
이 문서는 `/api/pages/*` 엔드포인트들의 응답 데이터 구조를 정리한 문서입니다.

---

## 🏆 랭킹 페이지 API

### 1. 랭킹 페이지 통합 데이터
**엔드포인트**: `GET /api/pages/ranking`  
**인증**: 선택적 (JWT 토큰 있으면 개인 순위 포함)

```json
{
  "message": "랭킹 페이지 데이터 조회 성공",
  "data": {
    "totalStats": {
      "weeklyTotalSupports": 150,
      "totalSupports": 1250,
      "activeCreators": 45
    },
    "weeklyRanking": [
      {
        "userNum": 1,
        "userName": "사용자1",
        "profileImageNum": 1,
        "profileImageBackNum": 1,
        "weeklySupports": 25,
        "ranking": 1
      },
      {
        "userNum": 2,
        "userName": "사용자2",
        "profileImageNum": 2,
        "profileImageBackNum": 2,
        "weeklySupports": 20,
        "ranking": 2
      }
    ],
    "totalRanking": [
      {
        "userNum": 1,
        "userName": "사용자1",
        "profileImageNum": 1,
        "profileImageBackNum": 1,
        "totalSupports": 150,
        "ranking": 1
      }
    ],
    "userStats": {
      "totalRank": 3,
      "totalSupports": 45,
      "weeklyRank": 5,
      "weeklySupports": 12
    },
    "categoryStats": [
      {
        "cateNum": 1,
        "cateName": "댄스",
        "uniqueReceivers": 15,
        "totalSupports": 300,
        "percentage": 24.0
      },
      {
        "cateNum": 2,
        "cateName": "보컬",
        "uniqueReceivers": 12,
        "totalSupports": 250,
        "percentage": 20.0
      }
    ]
  }
}
```

### 2. 주간 랭킹 상세 데이터
**엔드포인트**: `GET /api/pages/ranking/weekly?cateNum=1`  
**쿼리 파라미터**: `cateNum` (선택적, 카테고리 필터)

```json
{
  "message": "주간 랭킹 데이터 조회 성공",
  "data": {
    "ranking": [
      {
        "userNum": 1,
        "userName": "사용자1",
        "profileImageNum": 1,
        "profileImageBackNum": 1,
        "weeklySupports": 25,
        "contentCount": 5,
        "ranking": 1
      }
    ],
    "categoryInfo": {
      "cateNum": 1,
      "cateName": "댄스"
    },
    "period": "주간 (최근 7일)"
  }
}
```

### 3. 명예의 전당 데이터
**엔드포인트**: `GET /api/pages/ranking/hall-of-fame?cateNum=1`  
**쿼리 파라미터**: `cateNum` (선택적, 카테고리 필터)

```json
{
  "message": "명예의 전당 데이터 조회 성공",
  "data": {
    "ranking": [
      {
        "userNum": 1,
        "userName": "사용자1",
        "profileImageNum": 1,
        "profileImageBackNum": 1,
        "totalSupports": 150,
        "contentCount": 12,
        "ranking": 1
      }
    ],
    "categoryInfo": {
      "cateNum": 1,
      "cateName": "댄스"
    },
    "period": "전체 기간"
  }
}
```

---

## 🎉 축제 페이지 API

### 1. 축제 페이지 통합 데이터
**엔드포인트**: `GET /api/pages/festival`  
**인증**: 불필요

```json
{
  "message": "축제 페이지 데이터 조회 성공",
  "data": {
    "festivals": [
      {
        "challNum": 1,
        "challName": "K-POP 댄스 챌린지",
        "challDescription": "최고의 K-POP 댄스 영상을 만들어보세요!",
        "challStartDate": "2024-01-01 00:00:00",
        "challEndDate": "2024-01-31 23:59:59",
        "challPrize": 1000000,
        "participantCount": 25,
        "status": "진행중"
      },
      {
        "challNum": 2,
        "challName": "보컬 커버 챌린지",
        "challDescription": "인기 K-POP 곡을 커버해보세요!",
        "challStartDate": "2024-02-01 00:00:00",
        "challEndDate": "2024-02-28 23:59:59",
        "challPrize": 500000,
        "participantCount": 15,
        "status": "시작전"
      },
      {
        "challNum": 3,
        "challName": "완료된 챌린지",
        "challDescription": "이미 종료된 챌린지입니다.",
        "challStartDate": "2023-12-01 00:00:00",
        "challEndDate": "2023-12-31 23:59:59",
        "challPrize": 300000,
        "participantCount": 8,
        "status": "종료"
      }
    ]
  }
}
```

### 2. 축제 상세 데이터
**엔드포인트**: `GET /api/pages/festival/:challNum`  
**인증**: 불필요

```json
{
  "message": "축제 상세 데이터 조회 성공",
  "data": {
    "festival": {
      "challNum": 1,
      "challName": "K-POP 댄스 챌린지",
      "challDescription": "최고의 K-POP 댄스 영상을 만들어보세요!",
      "challStartDate": "2024-01-01 00:00:00",
      "challEndDate": "2024-01-31 23:59:59",
      "challPrize": 1000000,
      "participantCount": 25,
      "status": "진행중"
    },
    "participatingContents": [
      {
        "conNum": 1,
        "conTitle": "BTS Dynamite 커버 댄스",
        "conDate": "2024-01-15 14:30:00",
        "conSupports": 45,
        "userNum": 1,
        "userName": "댄서김",
        "profileImageNum": 1,
        "profileImageBackNum": 1,
        "cateNum": 1,
        "cateName": "댄스"
      },
      {
        "conNum": 2,
        "conTitle": "NewJeans OMG 댄스",
        "conDate": "2024-01-16 16:45:00",
        "conSupports": 32,
        "userNum": 2,
        "userName": "댄스마스터",
        "profileImageNum": 2,
        "profileImageBackNum": 2,
        "cateNum": 1,
        "cateName": "댄스"
      },
      {
        "conNum": 3,
        "conTitle": "ITZY SNEAKERS 댄스",
        "conDate": "2024-01-17 10:15:00",
        "conSupports": 28,
        "userNum": 3,
        "userName": "댄스퀸",
        "profileImageNum": 3,
        "profileImageBackNum": 3,
        "cateNum": 1,
        "cateName": "댄스"
      }
    ]
  }
}
```

---

## 📊 데이터 필드 설명

### 랭킹 관련 필드
- **totalStats**: 전체 통계 정보
  - `weeklyTotalSupports`: 주간 총 응원 수
  - `totalSupports`: 누적 총 응원 수
  - `activeCreators`: 활성 창작자 수

- **ranking**: 랭킹 정보
  - `userNum`: 사용자 번호
  - `userName`: 사용자 이름
  - `profileImageNum`: 프로필 이미지 번호
  - `profileImageBackNum`: 프로필 배경 이미지 번호
  - `weeklySupports`: 주간 응원 수
  - `totalSupports`: 총 응원 수
  - `contentCount`: 보유 콘텐츠 수
  - `ranking`: 순위

- **userStats**: 사용자 개인 통계 (로그인 시에만 포함)
  - `totalRank`: 총 순위
  - `totalSupports`: 총 응원 수
  - `weeklyRank`: 주간 순위
  - `weeklySupports`: 주간 응원 수

- **categoryStats**: 카테고리별 통계
  - `cateNum`: 카테고리 번호
  - `cateName`: 카테고리 이름
  - `uniqueReceivers`: 응원 받은 고유 사용자 수
  - `totalSupports`: 총 응원 수
  - `percentage`: 전체 대비 비율

### 축제 관련 필드
- **festival**: 축제 기본 정보
  - `challNum`: 챌린지 번호
  - `challName`: 챌린지 이름
  - `challDescription`: 챌린지 설명
  - `challStartDate`: 시작일
  - `challEndDate`: 종료일
  - `challPrize`: 상금
  - `participantCount`: 참여자 수
  - `status`: 상태 (진행중/시작전/종료)

- **participatingContents**: 참여 콘텐츠 목록
  - `conNum`: 콘텐츠 번호
  - `conTitle`: 콘텐츠 제목
  - `conDate`: 업로드 날짜
  - `conSupports`: 응원 수
  - `userNum`: 창작자 번호
  - `userName`: 창작자 이름
  - `profileImageNum`: 창작자 프로필 이미지
  - `profileImageBackNum`: 창작자 프로필 배경 이미지
  - `cateNum`: 카테고리 번호
  - `cateName`: 카테고리 이름

---

## 🔗 API 엔드포인트 요약

| 엔드포인트 | 메서드 | 인증 | 설명 |
|-----------|--------|------|------|
| `/api/pages/ranking` | GET | 선택적 | 랭킹 페이지 통합 데이터 |
| `/api/pages/ranking/weekly` | GET | 불필요 | 주간 랭킹 상세 데이터 |
| `/api/pages/ranking/hall-of-fame` | GET | 불필요 | 명예의 전당 데이터 |
| `/api/pages/festival` | GET | 불필요 | 축제 페이지 통합 데이터 |
| `/api/pages/festival/:challNum` | GET | 불필요 | 축제 상세 데이터 |

---

## 📝 사용 예시

### 프론트엔드에서 랭킹 페이지 데이터 요청
```javascript
// 랭킹 페이지 로드 시
const response = await fetch('/api/pages/ranking', {
  headers: {
    'Authorization': 'Bearer ' + token // 선택적
  }
});
const data = await response.json();
```

### 프론트엔드에서 축제 페이지 데이터 요청
```javascript
// 축제 페이지 로드 시
const response = await fetch('/api/pages/festival');
const data = await response.json();

// 특정 축제 상세 페이지
const festivalResponse = await fetch('/api/pages/festival/1');
const festivalData = await festivalResponse.json();
```

---

## 🚀 성능 최적화

- **통합 API**: 페이지별로 필요한 모든 데이터를 한 번의 요청으로 가져옴
- **선택적 인증**: 로그인하지 않은 사용자도 기본 데이터 조회 가능
- **쿼리 최적화**: JOIN과 집계 함수를 활용한 효율적인 데이터베이스 쿼리
- **캐싱 고려**: 자주 조회되는 랭킹 데이터는 캐싱 적용 가능

