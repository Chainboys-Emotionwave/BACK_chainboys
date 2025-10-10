// 필요한 라이브러리 설치: npm install ethers
const ethers = require('ethers');
const authService = require('./services/authService');

// 즉시 실행 함수를 사용하여 비동기 로직 실행
(async () => {
    // 1. 무작위로 새로운 지갑 생성
    const wallet = ethers.Wallet.createRandom();
    
    const walletAddress = wallet.address;

    // hardhat 관리자
    // const walletAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

    console.log("새로운 지갑 주소 (공개키):", walletAddress);

    const privateKey = wallet.privateKey;

    //hardhat 관리자
    // const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
    
    console.log("개인키 (비공개, 절대 공유 금지):", privateKey);

    // 2. 백엔드(authService)로부터 메시지 생성
    const message = await authService.generateSignatureMessage(walletAddress);
    console.log(message);

    // const wallet = new ethers.Wallet(privateKey);

    // 3. 지갑을 사용하여 메시지 서명
    const signature = await wallet.signMessage(message);
    console.log("서명된 메시지:", signature);

    // 4. 백엔드(authService)로 서명 및 주소 전송, 토큰 반환
    const result = await authService.verifySignatureAndLogin(walletAddress, signature);
    console.log("로그인 결과 (토큰):", result);

})();