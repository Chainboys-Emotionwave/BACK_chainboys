# 블록체인 기능 구현 문서

## 📋 개요
이 문서는 K-POP 창작 플랫폼에 추가된 블록체인 기능에 대한 구현 내용과 사용 방법을 정리한 문서입니다.

---

## 🏗️ 구현된 블록체인 기능

### 1. 챌린지 상금 관리
- **상금 예치**: 챌린지 시작 시 관리자 계정에서 상금을 스마트 컨트랙트에 예치
- **자동 분배**: 챌린지 종료 후 응원 수 기준으로 상금 자동 분배
- **상금 비율 설정**: 1위, 2위, 3위에 대한 상금 분배 비율 커스터마이징

### 2. 응원 기록 블록체인화
- **배치 처리**: 1시간마다 응원 데이터를 블록체인에 기록
- **가스 비용 최적화**: 개별 응원마다 기록하지 않고 배치로 처리
- **이벤트 로깅**: 모든 응원 활동을 블록체인 이벤트로 기록

---

## 📁 추가된 파일 구조

```
BACK_chainboys/
├── config/
│   └── blockchain.js                    # 블록체인 설정 및 ABI
├── services/
│   ├── blockchainService.js             # 기본 블록체인 서비스
│   ├── challengeBlockchainService.js    # 챌린지 블록체인 서비스
│   └── supportBlockchainService.js      # 응원 블록체인 서비스
├── controllers/
│   └── blockchainController.js          # 블록체인 컨트롤러
├── routes/
│   └── blockchainRoutes.js              # 블록체인 라우트
└── blockchainImplementation.md          # 이 문서
```

---

## 🗄️ 데이터베이스 스키마 변경사항

### challenges 테이블 추가 컬럼
```sql
ALTER TABLE challenges ADD COLUMN blockchainTxHash VARCHAR(66);
ALTER TABLE challenges ADD COLUMN blockchainBlockNumber BIGINT;
ALTER TABLE challenges ADD COLUMN distributionTxHash VARCHAR(66);
ALTER TABLE challenges ADD COLUMN distributionBlockNumber BIGINT;
ALTER TABLE challenges ADD COLUMN prizeDistribution JSON;
ALTER TABLE challenges ADD COLUMN blockchainStatus ENUM('created', 'distributed', 'failed') DEFAULT 'created';
ALTER TABLE challenges ADD COLUMN distributedAt TIMESTAMP NULL;
```

### supports 테이블 추가 컬럼
```sql
ALTER TABLE supports ADD COLUMN blockchainTxHash VARCHAR(66);
ALTER TABLE supports ADD COLUMN blockchainBlockNumber BIGINT;
ALTER TABLE supports ADD COLUMN blockchainRecordedAt TIMESTAMP NULL;
```

---

## 🔧 환경변수 설정

### .env 파일에 추가할 변수들
```env
# 블록체인 네트워크 설정
BLOCKCHAIN_NETWORK=sepolia  # sepolia, localhost

# RPC URL 설정
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
LOCALHOST_RPC_URL=http://localhost:8545

# 관리자 지갑 설정
ADMIN_PRIVATE_KEY=0x1234567890abcdef...

# 스마트 컨트랙트 주소
CHALLENGE_CONTRACT_ADDRESS=0x1234567890abcdef...
SUPPORT_CONTRACT_ADDRESS=0x1234567890abcdef...
```

---

## 🚀 API 엔드포인트

### 블록체인 상태 및 정보
- `GET /api/blockchain/status` - 블록체인 연결 상태 확인
- `GET /api/blockchain/contract-info` - 컨트랙트 정보 조회
- `GET /api/blockchain/transaction/:txHash` - 트랜잭션 상태 확인

### 챌린지 관련
- `POST /api/blockchain/challenge/:challNum/deposit` - 챌린지 상금 예치 (관리자)
- `POST /api/blockchain/challenge/:challNum/distribute` - 챌린지 상금 분배 (관리자)
- `GET /api/blockchain/challenge/:challNum/info` - 챌린지 블록체인 정보 조회

### 응원 관련
- `POST /api/blockchain/supports/record-hourly` - 1시간 배치 응원 기록
- `GET /api/blockchain/supports/history/:conNum` - 특정 콘텐츠 응원 히스토리
- `GET /api/blockchain/supports/status` - 응원 기록 상태 확인
- `POST /api/blockchain/supports/batch` - 수동 배치 처리 (관리자)

### 이벤트 조회
- `GET /api/blockchain/events?type=challenge&challNum=1` - 챌린지 이벤트 조회
- `GET /api/blockchain/events?type=support` - 응원 이벤트 조회

---

## 📊 스마트 컨트랙트 ABI

### Challenge Contract ABI
```json
[
  "function createChallenge(uint256 challengeId, uint256 prizeAmount) external",
  "function distributePrize(uint256 challengeId, address[] memory winners, uint256[] memory amounts) external",
  "function getChallengeInfo(uint256 challengeId) external view returns (uint256, address, uint256, bool)",
  "function getChallengeParticipants(uint256 challengeId) external view returns (address[] memory)",
  "event ChallengeCreated(uint256 indexed challengeId, address indexed creator, uint256 prizeAmount)",
  "event PrizeDistributed(uint256 indexed challengeId, address[] winners, uint256[] amounts)"
]
```

### Support Contract ABI
```json
[
  "function recordSupports(uint256[] memory contentIds, address[] memory supporters, uint256[] memory amounts, uint256 timestamp) external",
  "function getSupportHistory(uint256 contentId) external view returns (address[] memory, uint256[] memory, uint256[] memory)",
  "event SupportsRecorded(uint256[] contentIds, address[] supporters, uint256[] amounts, uint256 timestamp)"
]
```

---

## 🔄 자동화 스케줄러

### 1시간 배치 처리 설정
```javascript
// cron job 또는 node-cron을 사용하여 1시간마다 실행
const cron = require('node-cron');

// 매시간 정각에 실행
cron.schedule('0 * * * *', async () => {
    try {
        await supportBlockchainService.startHourlyBatch();
    } catch (error) {
        console.error('배치 처리 실패:', error);
    }
});
```

---

## 💡 사용 예시

### 1. 챌린지 상금 예치
```javascript
// POST /api/blockchain/challenge/1/deposit
{
  "prizeDistribution": {
    "first": 50,    // 1위: 50%
    "second": 30,   // 2위: 30%
    "third": 20     // 3위: 20%
  }
}
```

### 2. 챌린지 상금 분배
```javascript
// POST /api/blockchain/challenge/1/distribute
// 관리자 권한 필요
```

### 3. 응원 히스토리 조회
```javascript
// GET /api/blockchain/supports/history/123
// 응답: 해당 콘텐츠의 모든 응원 기록
```

### 4. 수동 배치 처리
```javascript
// POST /api/blockchain/supports/batch
{
  "contentIds": [1, 2, 3]  // 특정 콘텐츠들
}
// 또는
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

---

## ⚠️ 주의사항

### 1. 가스 비용 관리
- 블록체인 트랜잭션마다 가스 비용 발생
- 배치 처리로 가스 비용 최적화
- 네트워크 상태에 따라 가스 가격 조정 필요

### 2. 트랜잭션 실패 처리
- 네트워크 오류 시 재시도 로직 구현
- 실패한 트랜잭션에 대한 롤백 처리
- 관리자 알림 시스템 구축 권장

### 3. 보안 고려사항
- 관리자 개인키 보안 관리
- 컨트랙트 주소 검증
- 트랜잭션 서명 검증

---

## 🛠️ 개발 및 배포

### 1. 로컬 개발 환경
```bash
# Hardhat 또는 Truffle로 로컬 블록체인 실행
npx hardhat node

# 환경변수 설정
BLOCKCHAIN_NETWORK=localhost
ADMIN_PRIVATE_KEY=0x...
```

### 2. 테스트넷 배포
```bash
# Sepolia 테스트넷 사용
BLOCKCHAIN_NETWORK=sepolia
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/...
```

### 3. 메인넷 배포
```bash
# 이더리움 메인넷 사용 (주의: 실제 ETH 필요)
BLOCKCHAIN_NETWORK=mainnet
MAINNET_RPC_URL=https://mainnet.infura.io/v3/...
```

---

## 📈 모니터링 및 로깅

### 1. 트랜잭션 모니터링
- 모든 블록체인 트랜잭션 로깅
- 실패한 트랜잭션 추적
- 가스 사용량 모니터링

### 2. 이벤트 로깅
- 챌린지 생성/분배 이벤트
- 응원 기록 이벤트
- 에러 및 예외 상황 로깅

### 3. 성능 지표
- 배치 처리 성능
- 트랜잭션 확인 시간
- 블록체인 동기화 상태

---

## 🔮 향후 개선사항

### 1. 기능 확장
- NFT 뱃지 시스템
- 토큰 보상 시스템
- DAO 거버넌스

### 2. 성능 최적화
- Layer 2 솔루션 적용
- 가스 최적화
- 배치 크기 동적 조정

### 3. 사용자 경험
- 실시간 트랜잭션 상태
- 블록체인 데이터 시각화
- 모바일 지갑 연동

---

## 📞 지원 및 문의

블록체인 기능 관련 문의사항이나 문제가 발생할 경우, 다음 정보를 포함하여 문의해주세요:

1. 트랜잭션 해시
2. 에러 메시지
3. 네트워크 상태
4. 관련 로그 파일

이 문서는 블록체인 기능의 구현과 사용법을 종합적으로 다루고 있으며, 실제 운영 환경에서의 안정적인 서비스 제공을 위한 가이드라인을 제공합니다.

