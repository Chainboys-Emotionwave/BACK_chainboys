const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const auth = require('../middleware/auth');

// --- 사용자용 라우트 ---
// 내 뱃지 목록 조회
router.get('/me', auth, badgeController.getMyBadges);
// 특정 사용자의 뱃지 목록 조회
router.get('/user/:userNum', badgeController.getUserBadges);


// --- 관리자용 라우트 ---
// 모든 뱃지 목록 조회
router.get('/', auth, badgeController.getAllBadges);
// 뱃지 생성
router.post('/', auth, badgeController.createBadge);
// 뱃지 수정
router.put('/:badgesNum', auth, badgeController.updateBadge);
// 뱃지 삭제
router.delete('/:badgesNum', auth, badgeController.deleteBadge);


module.exports = router;
