const express = require('express');
const pagesController = require('../controllers/pagesController');
const router = express.Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

// 홈 페이지 통합 데이터
router.get('/home', optionalAuth, pagesController.getHomePageData);

// 랭킹 페이지 통합 데이터
router.get('/ranking', optionalAuth, pagesController.getRankingPageData);
router.get('/ranking/weekly', pagesController.getWeeklyRankingData);
router.get('/ranking/hall-of-fame', pagesController.getHallOfFameData);

// 축제 페이지 통합 데이터
router.get('/festival', pagesController.getFestivalPageData);
router.get('/festival/:challNum', pagesController.getFestivalDetailData);

// 내 집 페이지(컬렉션) 통합 데이터
router.get('/collection', auth, pagesController.getMyCollectionPageData);

// 창작자 프로필 페이지 통합 데이터
router.get('/creator/:userNum', pagesController.getCreatorProfilePageData);

module.exports = router;
