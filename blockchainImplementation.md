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

---

## 🔧 supportBlockchainService.js 상세 구현

### 서비스 파일 위치 및 역할
- **파일 경로**: `services/supportBlockchainService.js`
- **역할**: 응원 데이터의 블록체인 기록 및 조회를 담당하는 서비스
- **의존성**: `blockchainService`, `supportModel`, `ethers.js`

### 주요 메서드 구현

#### 1. `recordHourlySupports()`
**목적**: 1시간 동안의 응원 데이터를 블록체인에 배치 기록
```javascript
// 기능
- 최근 1시간 내 응원 데이터 조회
- 블록체인 트랜잭션 생성 및 전송
- DB에 트랜잭션 정보 업데이트
- 가스 비용 최적화를 위한 배치 처리

// 사용되는 모델 메서드
- supportModel.getSupportsForBlockchain(fromDate)
- supportModel.updateSupportsBlockchainInfo(supNums, blockchainInfo)
```

#### 2. `getSupportHistory(conNum)`
**목적**: 특정 콘텐츠의 블록체인 응원 히스토리 조회
```javascript
// 기능
- 스마트 컨트랙트에서 응원 기록 조회
- 응원자 주소, 금액, 타임스탬프 반환
- 블록체인 데이터와 DB 데이터 비교 가능
```

#### 3. `getSupportRecordStatus(conNum)`
**목적**: DB와 블록체인 간 응원 기록 동기화 상태 확인
```javascript
// 반환 데이터
{
  "dbCount": 15,           // DB의 응원 수
  "blockchainCount": 15,   // 블록체인의 응원 수
  "lastRecorded": "2024-01-15T10:30:00Z",  // 마지막 기록 시간
  "isSynced": true         // 동기화 상태
}
```

#### 4. `recordBatchSupports(contentIds)`
**목적**: 여러 콘텐츠의 응원을 수동으로 배치 기록
```javascript
// 기능
- 지정된 콘텐츠들의 미기록 응원 데이터 처리
- 각 콘텐츠별로 개별 트랜잭션 생성
- 실패한 콘텐츠에 대한 개별 에러 처리
```

#### 5. `recordSupportsByPeriod(startDate, endDate)`
**목적**: 특정 기간의 응원 데이터를 한 번에 기록
```javascript
// 기능
- 지정된 기간의 모든 응원 데이터 조회
- 대량 데이터를 하나의 트랜잭션으로 처리
- 가스 한도 증가 (2,000,000)
```

#### 6. `getSupportEvents(fromBlock, toBlock)`
**목적**: 블록체인 이벤트 로그 조회
```javascript
// 반환 데이터
[
  {
    "blockNumber": 12345,
    "transactionHash": "0x...",
    "contentIds": ["1", "2", "3"],
    "supporters": ["0x...", "0x..."],
    "amounts": ["1", "1"],
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

---

## 🚀 초기 설정 및 실행 가이드

### 1. 필수 의존성 설치
```bash
# ethers.js는 이미 package.json에 포함됨
npm install ethers

# 자동화 스케줄러를 위한 추가 패키지 (선택사항)
npm install node-cron
```

### 2. 환경변수 설정
```bash
# .env 파일에 다음 변수들 추가
BLOCKCHAIN_NETWORK=sepolia
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
ADMIN_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef12345678
CHALLENGE_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
SUPPORT_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

### 3. 데이터베이스 스키마 업데이트
```sql
-- supports 테이블에 블록체인 관련 컬럼 추가
ALTER TABLE supports ADD COLUMN blockchainTxHash VARCHAR(66);
ALTER TABLE supports ADD COLUMN blockchainBlockNumber BIGINT;
ALTER TABLE supports ADD COLUMN blockchainRecordedAt TIMESTAMP NULL;

-- challenges 테이블에 블록체인 관련 컬럼 추가
ALTER TABLE challenges ADD COLUMN blockchainTxHash VARCHAR(66);
ALTER TABLE challenges ADD COLUMN blockchainBlockNumber BIGINT;
ALTER TABLE challenges ADD COLUMN distributionTxHash VARCHAR(66);
ALTER TABLE challenges ADD COLUMN distributionBlockNumber BIGINT;
ALTER TABLE challenges ADD COLUMN prizeDistribution JSON;
ALTER TABLE challenges ADD COLUMN blockchainStatus ENUM('created', 'distributed', 'failed') DEFAULT 'created';
ALTER TABLE challenges ADD COLUMN distributedAt TIMESTAMP NULL;
```

### 4. 서버 시작
```bash
npm start
# 또는 개발 모드
npm run dev
```

---

## 📞 API 호출 상세 가이드

### 블록체인 상태 확인
```bash
# 기본 상태 확인
curl -X GET http://localhost:3000/api/blockchain/status

# 응답 예시
{
  "message": "블록체인 상태 조회 성공",
  "data": {
    "connected": true,
    "network": "sepolia",
    "chainId": "11155111",
    "adminBalance": "1.5",
    "adminAddress": "0x..."
  }
}
```

### 응원 기록 관련 API

#### 1. 1시간 배치 응원 기록
```bash
# 수동으로 1시간 배치 실행
curl -X POST http://localhost:3000/api/blockchain/supports/record-hourly

# 응답 예시
{
  "message": "응원 블록체인 기록 성공",
  "data": {
    "success": true,
    "txHash": "0x...",
    "blockNumber": 12345,
    "gasUsed": "150000",
    "recordedCount": 25,
    "timestamp": 1642234567
  }
}
```

#### 2. 특정 콘텐츠 응원 히스토리 조회
```bash
# 콘텐츠 ID 123의 응원 히스토리 조회
curl -X GET http://localhost:3000/api/blockchain/supports/history/123

# 응답 예시
{
  "message": "응원 히스토리 조회 성공",
  "data": {
    "supporters": ["0x...", "0x..."],
    "amounts": ["1", "1"],
    "timestamps": ["2024-01-15T10:30:00Z", "2024-01-15T11:30:00Z"]
  }
}
```

#### 3. 응원 기록 상태 확인
```bash
# 전체 응원 기록 상태 확인
curl -X GET http://localhost:3000/api/blockchain/supports/status

# 특정 콘텐츠 응원 기록 상태 확인
curl -X GET "http://localhost:3000/api/blockchain/supports/status?conNum=123"

# 응답 예시
{
  "message": "응원 기록 상태 조회 성공",
  "data": {
    "dbCount": 15,
    "blockchainCount": 15,
    "lastRecorded": "2024-01-15T10:30:00Z",
    "isSynced": true
  }
}
```

#### 4. 수동 배치 처리 (관리자 전용)
```bash
# 특정 콘텐츠들 배치 처리
curl -X POST http://localhost:3000/api/blockchain/supports/batch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentIds": [1, 2, 3]
  }'

# 특정 기간 배치 처리
curl -X POST http://localhost:3000/api/blockchain/supports/batch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }'

# 응답 예시
{
  "message": "배치 응원 기록 성공",
  "data": {
    "success": true,
    "results": [
      {
        "conNum": 1,
        "success": true,
        "txHash": "0x...",
        "recordedCount": 5
      }
    ]
  }
}
```

### 챌린지 관련 API

#### 1. 챌린지 상금 예치 (관리자 전용)
```bash
# 챌린지 1번에 상금 예치
curl -X POST http://localhost:3000/api/blockchain/challenge/1/deposit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prizeDistribution": {
      "first": 50,
      "second": 30,
      "third": 20
    }
  }'

# 응답 예시
{
  "message": "챌린지 상금 예치 성공",
  "data": {
    "success": true,
    "txHash": "0x...",
    "blockNumber": 12345,
    "gasUsed": "150000",
    "prizeAmount": 1000000
  }
}
```

#### 2. 챌린지 상금 분배 (관리자 전용)
```bash
# 챌린지 1번 상금 분배
curl -X POST http://localhost:3000/api/blockchain/challenge/1/distribute \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 응답 예시
{
  "message": "챌린지 상금 분배 성공",
  "data": {
    "success": true,
    "txHash": "0x...",
    "blockNumber": 12346,
    "gasUsed": "200000",
    "winners": [
      {
        "userNum": 1,
        "rank": 1,
        "amount": "0.5"
      }
    ]
  }
}
```

### 이벤트 조회 API

#### 1. 응원 이벤트 조회
```bash
# 모든 응원 이벤트 조회
curl -X GET "http://localhost:3000/api/blockchain/events?type=support"

# 특정 블록 범위 응원 이벤트 조회
curl -X GET "http://localhost:3000/api/blockchain/events?type=support&fromBlock=10000&toBlock=11000"
```

#### 2. 챌린지 이벤트 조회
```bash
# 챌린지 1번 이벤트 조회
curl -X GET "http://localhost:3000/api/blockchain/events?type=challenge&challNum=1"
```

---

## 🔄 자동화 스케줄러 구현

### 1. node-cron을 사용한 자동 배치 처리
```javascript
// app.js 또는 별도 스케줄러 파일에 추가
const cron = require('node-cron');
const supportBlockchainService = require('./services/supportBlockchainService');

// 매시간 정각에 실행
cron.schedule('0 * * * *', async () => {
    console.log('응원 블록체인 배치 처리 시작...');
    try {
        const result = await supportBlockchainService.startHourlyBatch();
        console.log('배치 처리 완료:', result);
    } catch (error) {
        console.error('배치 처리 실패:', error.message);
    }
});

// 매일 오전 2시에 전체 동기화 체크
cron.schedule('0 2 * * *', async () => {
    console.log('전체 동기화 체크 시작...');
    try {
        const status = await supportBlockchainService.getSupportRecordStatus();
        if (!status.isSynced) {
            console.log('동기화 불일치 감지, 수동 처리 필요');
        }
    } catch (error) {
        console.error('동기화 체크 실패:', error.message);
    }
});
```

### 2. PM2를 사용한 프로세스 관리
```bash
# PM2 설치
npm install -g pm2

# 스케줄러를 별도 프로세스로 실행
pm2 start scheduler.js --name "blockchain-scheduler"
```

---

## 🔍 디버깅 및 모니터링

### 1. 로그 확인
```bash
# 서버 로그에서 블록체인 관련 로그 확인
tail -f logs/app.log | grep "blockchain"

# 특정 트랜잭션 상태 확인
curl -X GET http://localhost:3000/api/blockchain/transaction/0x...
```

### 2. 데이터베이스 상태 확인
```sql
-- 미기록 응원 데이터 확인
SELECT COUNT(*) FROM supports WHERE blockchainTxHash IS NULL;

-- 챌린지 블록체인 상태 확인
SELECT challNum, challName, blockchainStatus, blockchainTxHash FROM challenges;

-- 응원 기록 동기화 상태 확인
SELECT 
    COUNT(*) as total,
    COUNT(blockchainTxHash) as recorded,
    COUNT(*) - COUNT(blockchainTxHash) as unrecorded
FROM supports;
```

### 3. 성능 모니터링
```javascript
// 트랜잭션 처리 시간 측정
const startTime = Date.now();
const result = await supportBlockchainService.recordHourlySupports();
const endTime = Date.now();
console.log(`처리 시간: ${endTime - startTime}ms`);
```

이 문서는 블록체인 기능의 구현과 사용법을 종합적으로 다루고 있으며, 실제 운영 환경에서의 안정적인 서비스 제공을 위한 가이드라인을 제공합니다.



---

## 🆕 추가 구현: Challenge.sol / Support.sol

### 개요
최근 이슈(ABI 불일치, 이벤트 미발행, 뷰 함수 부재)를 해결하기 위해 두 개의 핵심 스마트 컨트랙트를 새로 추가했습니다.

- `contracts/Challenge.sol` (Solidity ^0.8.24): 챌린지 상금 예치/분배 관리
- `contracts/Support.sol` (Solidity ^0.8.24): 응원 기록의 배치 저장 및 히스토리 조회
- `scripts/deploy.js`: 두 컨트랙트 동시 배포 스크립트 (Hardhat, Ethers v6)

두 컨트랙트는 Hardhat 설정(`hardhat.config.js`의 `solidity: "0.8.24"`)과 맞추어 컴파일됩니다.

---

### Challenge.sol: 기능 및 구현
- **상태 구조**: `challengeId => { creator, prizeAmount, distributedAmount, active }`
- **핵심 함수**
  - `createChallenge(uint256 challengeId, uint256 prizeAmount)`
    - `msg.value`와 `prizeAmount`가 동일해야 하며, 컨트랙트에 상금이 에스크로됩니다.
    - 동일 `challengeId` 재생성 방지.
    - 이벤트 `ChallengeCreated` 발생.
  - `distributePrize(uint256 challengeId, address[] winners, uint256[] amounts)`
    - 오직 `creator`만 호출 가능.
    - 합계가 남은 상금 한도를 초과하면 실패.
    - 각 수상자에게 ETH 전송(Checks-Effects-Interactions 순서 적용).
    - 전액 분배 시 `active=false` 처리.
    - 이벤트 `PrizeDistributed` 발생.
  - `getChallengeInfo(uint256 challengeId)`
    - `(creator, prizeAmount, distributedAmount, active)` 반환.

- **이벤트**
  - `ChallengeCreated(uint256 indexed challengeId, address indexed creator, uint256 prizeAmount)`
  - `PrizeDistributed(uint256 indexed challengeId, address[] winners, uint256[] amounts)`

- **API 연계**
  - `POST /api/blockchain/challenge/:challNum/deposit` → `createChallenge(challNum, prizeAmount)` 호출, `value`로 상금 전달
  - `POST /api/blockchain/challenge/:challNum/distribute` → `distributePrize(challNum, winners, amounts)` 호출
  - `GET /api/blockchain/challenge/:challNum/info` → `getChallengeInfo(challNum)` 조회

---

### Support.sol: 기능 및 구현
- **상태 구조**: `contentId => { supporters[], amounts[], timestamps[] }`
- **핵심 함수**
  - `recordSupports(uint256[] contentIds, address[] supporters, uint256[] amounts, uint256 timestamp)`
    - 동일 길이의 배열 배치 입력을 검증 후, 각 인덱스의 레코드를 해당 `contentId` 버킷에 저장.
    - 이벤트 `SupportsRecorded`를 정확히 발행(배치 전체의 입력을 이벤트에 포함).
  - `getSupportHistory(uint256 contentId)`
    - `(supporters[], amounts[], timestamps[])`를 그대로 반환.

- **이벤트**
  - `SupportsRecorded(uint256[] contentIds, address[] supporters, uint256[] amounts, uint256 timestamp)`

- **API 연계**
  - `POST /api/blockchain/supports/record-hourly` 및 `POST /api/blockchain/supports/batch` → `recordSupports(...)` 호출
  - `GET /api/blockchain/supports/history/:conNum` → `getSupportHistory(conNum)` 조회
  - `GET /api/blockchain/events?type=support` → `SupportsRecorded` 이벤트 필터로 조회

---

### 문제 해결 요약 (근본 원인 → 조치)
- **GET /supports/history/:conNum 실패 ("could not decode result data")**
  - 원인: 컨트랙트에 `getSupportHistory` 미구현 또는 잘못된 주소/ABI.
  - 조치: `Support.sol`에 `getSupportHistory` 구현 및 정확한 반환 시그니처 제공. 배포 주소 업데이트 필요.

- **GET /events?type=support 시 `data: []`**
  - 원인: 배치 기록 함수에서 이벤트 미발행 또는 이벤트 시그니처 불일치.
  - 조치: `SupportsRecorded(...)` 이벤트를 `recordSupports` 내에서 정확히 발행.

- **챌린지 분배 관련 주소/에러**
  - 조치: `Challenge.sol`에 예치/분배 로직을 명확히 구현하고, `creator` 권한 및 금액 합산 검증 추가.

---

### 배포와 주소 설정
- 배포 스크립트: `scripts/deploy.js`
  - Ethers v6 기준 배포 후 주소는 `contract.target`로 접근.
  - 두 컨트랙트 모두 배포하며, 콘솔에 주소 출력.
- 환경변수(.env) 예시
  - `CHALLENGE_CONTRACT_ADDRESS=0x...`
  - `SUPPORT_CONTRACT_ADDRESS=0x...`
- 서버에서 사용
  - `config/blockchain.js` 또는 관련 서비스들이 위 주소를 사용해 인스턴스 생성.

---

### Ethers.js v6 통합 주의사항 (백엔드 서비스 연계)
- 컨트랙트 팩토리: `await hre.ethers.getContractFactory("Challenge")`
- 배포 대기: `await contract.waitForDeployment()`
- 주소 접근: `contract.target`
- 함수 호출 예시
  - 응원 기록 배치:
    ```javascript
    await supportContract.recordSupports(contentIds, supporters, amounts, timestamp);
    ```
  - 응원 히스토리 조회:
    ```javascript
    const [supporters, amounts, timestamps] = await supportContract.getSupportHistory(conNum);
    ```
  - 챌린지 예치:
    ```javascript
    await challengeContract.createChallenge(challNum, prizeAmount, { value: prizeAmount });
    ```
  - 챌린지 분배:
    ```javascript
    await challengeContract.distributePrize(challNum, winners, amounts);
    ```

---

### 보안/운영 체크리스트
- `createChallenge` 시 `msg.value == prizeAmount` 검증 필수.
- `distributePrize`는 생성자(`creator`)만 호출 가능.
- 이벤트 인덱싱: `challengeId`는 `indexed`로 이벤트 필터링 최적화.
- 배치 입력 시 길이 불일치 방지(`length mismatch` 검사).
- 배포 후 주소를 `.env` 및 `config/blockchain.js`에 정확히 반영.
