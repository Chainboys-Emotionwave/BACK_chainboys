# 블록체인 K-POP 창작 컨텐츠 유통 플랫폼 (백엔드)
## 환경 설정
node.js v22.19.0

## Mac 설치 방법
```
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"
# Download and install Node.js:
nvm install 22
# Verify the Node.js version:
node -v # Should print "v22.19.0".
# Verify npm version:
npm -v # Should print "10.9.3".
```
## Windows 설치 방법
https://nodejs.org/en/download 에 접속하여 아래 설치 파일을 다운로드

서버 실행
```
npm run dev
```
Bash 혹은 console에 위 명령어를 통해서 실행가능

## swagger
http://localhost:3000/api-docs/

## 테스트 위한 jwt 토큰 받기
node test_login_flow 로 실행


# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

사용하고 계신 K-POP 창작 플랫폼 백엔드의 블록체인 연동 API 문서와 실행 명령어를 깔끔하게 정리해 드립니다.

## 🔗 블록체인 관련 API 엔드포인트 요약

`/api/blockchain` 경로를 사용하는 모든 API는 챌린지 상금 관리 및 응원 기록 관리를 담당합니다.

| 태그 | 경로 (Endpoint) | HTTP 메서드 | 설명 | 권한 |
| :--- | :--- | :--- | :--- | :--- |
| **일반 상태** | `/api/blockchain/status` | `GET` | 블록체인 네트워크 연결 상태 및 관리자 지갑 잔고를 확인합니다. | 없음 |
| **일반 상태** | `/api/blockchain/contract-info` | `GET` | 설정된 스마트 컨트랙트 주소 정보를 조회합니다. | 없음 |
| **일반 상태** | `/api/blockchain/transaction/:txHash` | `GET` | 특정 트랜잭션 해시의 블록체인 기록 상태(성공/실패, 블록번호)를 조회합니다. | 없음 |
| **이벤트** | `/api/blockchain/events?type={type}&challNum={num}` | `GET` | 블록체인 이벤트 로그를 조회합니다. (`type`은 `challenge` 또는 `support`) | 없음 |
| **챌린지** | `/api/blockchain/challenge/:challNum/deposit` | `POST` | 챌린지 상금을 스마트 컨트랙트에 예치하고 블록체인에 생성 기록을 남깁니다. | 관리자 |
| **챌린지** | `/api/blockchain/challenge/:challNum/distribute` | `POST` | 챌린지 종료 후, 응원 수 순위에 따라 상금을 우승자에게 분배합니다. | 관리자 |
| **챌린지** | `/api/blockchain/challenge/:challNum/info` | `GET` | 챌린지 관련 DB 및 블록체인(예치자, 상금 금액, 활성 상태) 정보를 조회합니다. | 없음 |
| **응원 기록** | `/api/blockchain/supports/record-hourly` | `POST` | DB에 쌓인 미기록 응원 데이터를 일괄적으로 블록체인에 기록합니다. (실제 운영 시에는 크론잡으로 자동 실행) | 없음 |
| **응원 기록** | `/api/blockchain/supports/history/:conNum` | `GET` | 특정 콘텐츠에 대한 블록체인 상의 응원 기록(응원자 주소, 금액, 시간)을 조회합니다. | 없음 |
| **응원 기록** | `/api/blockchain/supports/status` | `GET` | DB와 블록체인 간의 응원 기록 동기화 상태를 확인합니다. | 없음 |
| **응원 기록** | `/api/blockchain/supports/batch` | `POST` | 관리자가 특정 콘텐츠 또는 기간의 미기록 응원 데이터를 수동으로 배치 처리합니다. | 관리자 |

---

## 🛠️ 블록체인 테스트 환경 실행 명령어

블록체인 기능을 테스트하기 위해서는 Hardhat 노드, DB, 백엔드 서버의 순차적인 실행 및 환경 설정이 필요합니다.

### 1. Hardhat 로컬 노드 환경 준비

| 순서 | 명령어 | 터미널 | 설명 |
| :--- | :--- | :--- | :--- |
| **1.1** | `npx hardhat node` | **[터미널 A]** | 테스트용 로컬 블록체인 서버를 실행합니다. **이 창은 켜 둔 채로 유지**해야 합니다. |
| **1.2** | `npx hardhat compile` | **[터미널 B]** | Solidity 컨트랙트 파일을 컴파일하여 배포 준비를 합니다. |
| **1.3** | `npx hardhat run scripts/deploy.js --network localhost` | **[터미널 B]** | 컴파일된 `Challenge.sol` 및 `Support.sol`을 실행 중인 로컬 노드에 배포하고, **배포된 주소**를 출력합니다. |

### 2. 백엔드 환경 설정 업데이트 (`.env` 파일)

단계 1.3의 결과로 출력된 **새로운 주소**와 Hardhat 노드 시작 시 출력된 **개인키**를 `.env` 파일에 정확하게 반영합니다.

| 변수 | 값 (Hardhat 출력값으로 덮어쓰기) | 용도 |
| :--- | :--- | :--- |
| `BLOCKCHAIN_NETWORK` | `localhost` | 로컬 노드 사용 설정 |
| `ADMIN_PRIVATE_KEY` | (Account #0의 개인키) | 관리자 지갑 설정 |
| `CHALLENGE_CONTRACT_ADDRESS` | (Challenge 배포 주소) | 백엔드가 통신할 Challenge 컨트랙트의 주소 |
| `SUPPORT_CONTRACT_ADDRESS` | (Support 배포 주소) | 백엔드가 통신할 Support 컨트랙트의 주소 |

### 3. 백엔드 서버 및 테스트 실행

| 순서 | 명령어 | 터미널 | 설명 |
| :--- | :--- | :--- | :--- |
| **3.1** | `npm install` | **[터미널 B]** | (초기 1회) 필요한 모든 Node.js 패키지를 설치합니다. |
| **3.2** | `npm run dev` | **[터미널 B]** | 백엔드 서버를 실행합니다. (블록체인 설정이 로드됨) |
| **3.3** | `node test_login_flow.js` | **[터미널 C]** | 관리자 권한으로 로그인하여 **테스트용 JWT 토큰**을 확보합니다. |
| **3.4** | (API 호출) | **[Postman/Curl 등]** | 확보한 토큰으로 위 API 목록을 호출하며 테스트를 진행합니다. |