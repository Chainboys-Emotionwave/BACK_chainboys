const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const auth = require('../middleware/auth');

// 사용자 보상 기록 조회 (인증 필요)
router.get('/users/:userNum', auth, rewardController.getUserRewards);

// 사용자 총 보상 금액 조회 (인증 필요)
router.get('/users/:userNum/total', auth, rewardController.getUserTotalReward);

// 전체 보상 통계 조회 (인증 필요)
router.get('/stats', auth, rewardController.getRewardStats);

// 기간별 보상 기록 조회 (인증 필요)
router.get('/period', auth, rewardController.getRewardsByPeriod);

// 보상 생성 (관리자 전용)
router.post('/create', auth, rewardController.createReward);

module.exports = router;
