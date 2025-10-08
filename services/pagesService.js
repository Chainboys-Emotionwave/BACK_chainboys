const pagesModel = require('../models/pagesModel');

// 랭킹 페이지 통합 데이터 조회
exports.getRankingPageData = async (userNum) => {
    try {
        // 전체 랭킹 데이터 조회
        const [totalStats, weeklyRanking, totalRanking, userStats, categoryStats] = await Promise.all([
            pagesModel.getTotalRankingStats(),
            pagesModel.getWeeklyRanking(10), // 상위 10위
            pagesModel.getTotalRanking(10),  // 상위 10위
            userNum ? pagesModel.getUserRankingStats(userNum) : null,
            pagesModel.getCategoryStats()
        ]);

        return {
            totalStats,
            weeklyRanking,
            totalRanking,
            userStats,
            categoryStats
        };
    } catch (error) {
        throw new Error('랭킹 페이지 데이터 조회 실패 : ' + error.message);
    }
};

// 주간 랭킹 데이터 조회
exports.getWeeklyRankingData = async (cateNum) => {
    try {
        const [weeklyRanking, categoryInfo] = await Promise.all([
            pagesModel.getWeeklyRankingWithDetails(10, cateNum),
            cateNum ? pagesModel.getCategoryInfo(cateNum) : null
        ]);

        return {
            ranking: weeklyRanking,
            categoryInfo,
            period: '주간 (최근 7일)'
        };
    } catch (error) {
        throw new Error('주간 랭킹 데이터 조회 실패 : ' + error.message);
    }
};

// 명예의 전당 데이터 조회
exports.getHallOfFameData = async (cateNum) => {
    try {
        const [totalRanking, categoryInfo] = await Promise.all([
            pagesModel.getTotalRankingWithDetails(10, cateNum),
            cateNum ? pagesModel.getCategoryInfo(cateNum) : null
        ]);

        return {
            ranking: totalRanking,
            categoryInfo,
            period: '전체 기간'
        };
    } catch (error) {
        throw new Error('명예의 전당 데이터 조회 실패 : ' + error.message);
    }
};

// 축제 페이지 통합 데이터 조회
exports.getFestivalPageData = async () => {
    try {
        const activeFestivals = await pagesModel.getActiveFestivals();
        
        return {
            festivals: activeFestivals
        };
    } catch (error) {
        throw new Error('축제 페이지 데이터 조회 실패 : ' + error.message);
    }
};

// 축제 상세 데이터 조회
exports.getFestivalDetailData = async (challNum) => {
    try {
        const [festivalInfo, participatingContents] = await Promise.all([
            pagesModel.getFestivalInfo(challNum),
            pagesModel.getFestivalParticipatingContents(challNum)
        ]);

        return {
            festival: festivalInfo,
            participatingContents
        };
    } catch (error) {
        throw new Error('축제 상세 데이터 조회 실패 : ' + error.message);
    }
};
