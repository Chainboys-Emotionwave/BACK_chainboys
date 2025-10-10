const express = require('express');
const pagesController = require('../controllers/pagesController');
const router = express.Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

// 랭킹 페이지 통합 데이터
router.get('/ranking', optionalAuth, pagesController.getRankingPageData);
router.get('/ranking/weekly', pagesController.getWeeklyRankingData);
router.get('/ranking/hall-of-fame', pagesController.getHallOfFameData);

// 축제 페이지 통합 데이터
router.get('/festival', pagesController.getFestivalPageData);
router.get('/festival/:challNum', pagesController.getFestivalDetailData);

module.exports = router;
