const pagesService = require('../services/pagesService');

// 홈 페이지 통합 데이터 조회
exports.getHomePageData = async (req, res) => {
    try {
        const userNum = req.userData ? req.userData.userNum : null;
        const homeData = await pagesService.getHomePageData(userNum);
        res.status(200).json({
            message: '홈 페이지 데이터 조회 성공',
            data: homeData
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 랭킹 페이지 통합 데이터 조회
exports.getRankingPageData = async (req, res) => {
    try {
        const userNum = req.userData ? req.userData.userNum : null;
        const rankingData = await pagesService.getRankingPageData(userNum);
        
        res.status(200).json({
            message: '랭킹 페이지 데이터 조회 성공',
            data: rankingData
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 주간 랭킹 데이터 조회
exports.getWeeklyRankingData = async (req, res) => {
    try {
        const { cateNum } = req.query;
        const weeklyRankingData = await pagesService.getWeeklyRankingData(cateNum);
        
        res.status(200).json({
            message: '주간 랭킹 데이터 조회 성공',
            data: weeklyRankingData
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 명예의 전당 데이터 조회
exports.getHallOfFameData = async (req, res) => {
    try {
        const { cateNum } = req.query;
        const hallOfFameData = await pagesService.getHallOfFameData(cateNum);
        
        res.status(200).json({
            message: '명예의 전당 데이터 조회 성공',
            data: hallOfFameData
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 축제 페이지 통합 데이터 조회
exports.getFestivalPageData = async (req, res) => {
    try {
        const festivalData = await pagesService.getFestivalPageData();
        
        res.status(200).json({
            message: '축제 페이지 데이터 조회 성공',
            data: festivalData
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 축제 상세 데이터 조회
exports.getFestivalDetailData = async (req, res) => {
    try {
        const { challNum } = req.params;
        const festivalDetailData = await pagesService.getFestivalDetailData(challNum);
        
        res.status(200).json({
            message: '축제 상세 데이터 조회 성공',
            data: festivalDetailData
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 내 집 페이지(컬렉션) 통합 데이터 조회
exports.getMyCollectionPageData = async (req, res) => {
    try {
        const userNum = req.userData.userNum;
        if (!userNum) {
            return res.status(401).send('인증되지 않은 사용자입니다.');
        }
        const collectionData = await pagesService.getMyCollectionPageData(userNum);
        
        res.status(200).json({
            message: '내 집 페이지 데이터 조회 성공',
            data: collectionData
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};