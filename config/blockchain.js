const { ethers } = require('ethers');
require('dotenv').config();

// 블록체인 네트워크 설정
const NETWORK_CONFIG = {
    // Sepolia 테스트넷 (개발용)
    sepolia: {
        name: 'sepolia',
        chainId: 11155111,
        rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
        explorerUrl: 'https://sepolia.etherscan.io'
    },
    // 로컬 개발용
    localhost: {
        name: 'localhost',
        chainId: 31337,
        rpcUrl: 'http://localhost:8545',
        explorerUrl: 'http://localhost:8545'
    }
};

// 현재 사용할 네트워크 (환경변수로 설정 가능)
const CURRENT_NETWORK = process.env.BLOCKCHAIN_NETWORK || 'sepolia';

// Provider 설정
const getProvider = () => {
    const network = NETWORK_CONFIG[CURRENT_NETWORK];
    if (!network) {
        throw new Error(`지원하지 않는 네트워크: ${CURRENT_NETWORK}`);
    }
    
    return new ethers.JsonRpcProvider(network.rpcUrl);
};

// Wallet 설정 (관리자 지갑)
const getAdminWallet = () => {
    const privateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('ADMIN_PRIVATE_KEY 환경변수가 설정되지 않았습니다.');
    }
    
    const provider = getProvider();
    return new ethers.Wallet(privateKey, provider);
};

// 스마트 컨트랙트 ABI (실제 배포된 컨트랙트의 ABI로 교체 필요)
const CHALLENGE_CONTRACT_ABI = [
    "function createChallenge(uint256 challengeId, uint256 prizeAmount) external",
    "function distributePrize(uint256 challengeId, address[] memory winners, uint256[] memory amounts) external",
    "function getChallengeInfo(uint256 challengeId) external view returns (uint256, address, uint256, bool)",
    "function getChallengeParticipants(uint256 challengeId) external view returns (address[] memory)",
    "event ChallengeCreated(uint256 indexed challengeId, address indexed creator, uint256 prizeAmount)",
    "event PrizeDistributed(uint256 indexed challengeId, address[] winners, uint256[] amounts)"
];

const SUPPORT_CONTRACT_ABI = [
    "function recordSupports(uint256[] memory contentIds, address[] memory supporters, uint256[] memory amounts, uint256 timestamp) external",
    "function getSupportHistory(uint256 contentId) external view returns (address[] memory, uint256[] memory, uint256[] memory)",
    "event SupportsRecorded(uint256[] contentIds, address[] supporters, uint256[] amounts, uint256 timestamp)"
];

// 스마트 컨트랙트 주소 (실제 배포된 컨트랙트 주소로 교체 필요)
const CONTRACT_ADDRESSES = {
    challenge: process.env.CHALLENGE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    support: process.env.SUPPORT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'
};

// Gas 설정
const GAS_CONFIG = {
    gasLimit: 500000,
    gasPrice: ethers.parseUnits('20', 'gwei') // 20 Gwei
};

// 상금 분배 비율 설정 (기본값)
const DEFAULT_PRIZE_DISTRIBUTION = {
    first: 50,    // 1위: 50%
    second: 30,   // 2위: 30%
    third: 20     // 3위: 20%
};

module.exports = {
    NETWORK_CONFIG,
    CURRENT_NETWORK,
    getProvider,
    getAdminWallet,
    CHALLENGE_CONTRACT_ABI,
    SUPPORT_CONTRACT_ABI,
    CONTRACT_ADDRESSES,
    GAS_CONFIG,
    DEFAULT_PRIZE_DISTRIBUTION
};

