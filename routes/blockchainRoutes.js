const express = require('express');
const blockchainController = require('../controllers/blockchainController');
const router = express.Router();
const auth = require('../middleware/auth');

// 블록체인 상태 및 정보
router.get('/status', blockchainController.getBlockchainStatus);
router.get('/contract-info', blockchainController.getContractInfo);
router.get('/transaction/:txHash', blockchainController.getTransactionStatus);

// 챌린지 관련 블록체인 기능
router.post('/challenge/:challNum/deposit', auth, blockchainController.depositChallengePrize);
router.post('/challenge/:challNum/distribute', auth, blockchainController.distributeChallengePrize);
router.get('/challenge/:challNum/info', blockchainController.getChallengeBlockchainInfo);

// 응원 관련 블록체인 기능
router.post('/supports/record-hourly', blockchainController.recordHourlySupports);
router.get('/supports/history/:conNum', blockchainController.getSupportHistory);
router.get('/supports/status', blockchainController.getSupportRecordStatus);
router.post('/supports/batch', auth, blockchainController.recordBatchSupports);

// 블록체인 이벤트 조회
router.get('/events', blockchainController.getBlockchainEvents);

module.exports = router;


