// require("@nomicfoundation/hardhat-toolbox");

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.28",
// };

// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox"); 
require('dotenv').config({ path: __dirname + '/.env' }); // .env 파일 로드

module.exports = {
  solidity: "0.8.24", // 컨트랙트 솔리디티 버전에 맞게 수정
  networks: {
    // 로컬 백엔드 서버에서 사용할 Hardhat 노드 설정
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Sepolia 테스트넷 설정 (필요시)
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.ADMIN_PRIVATE_KEY]
    }
  }
};