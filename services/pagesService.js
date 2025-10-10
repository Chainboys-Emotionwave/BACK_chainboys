const pagesModel = require('../models/pagesModel');
const badgeModel = require('../models/badgeModel'); // 뱃지 모델 추가

// 랭킹 데이터를 받아서 각 유저에게 뱃지 정보를 추가하는 헬퍼 함수
const addBadgesToRankings = async (rankingData) => {
    if (!rankingData || rankingData.length === 0) {
        return [];
    }
    const userNums = rankingData.map(user => user.userNum);
    
    // 각 유저의 뱃지 정보를 병렬로 조회
    const badgePromises = userNums.map(userNum => badgeModel.findUserBadges(userNum));
    const badgesForUsers = await Promise.all(badgePromises);
    
    // 뱃지 정보를 랭킹 데이터에 매핑
    return rankingData.map((user, index) => ({
        ...user,
        badges: badgesForUsers[index] || [] // 뱃지가 없으면 빈 배열
    }));
};


// 랭킹 페이지 통합 데이터 조회
exports.getRankingPageData = async (userNum) => {
    try {
        // 전체 랭킹 데이터 조회
        const [totalStats, weeklyRankingRaw, totalRankingRaw, userStats, categoryStatsRaw] = await Promise.all([
            pagesModel.getTotalRankingStats(),
            pagesModel.getWeeklyRanking(10), // 상위 10위
            pagesModel.getTotalRanking(10),  // 상위 10위
            userNum ? pagesModel.getUserRankingStats(userNum) : Promise.resolve(null),
            pagesModel.getCategoryStats()
        ]);

        // categoryStats의 percentage를 숫자로 변환
        const categoryStats = categoryStatsRaw.map(stat => ({
            ...stat,
            percentage: parseFloat(stat.percentage) || 0
        }));

        // 2. 주간/전체 랭킹에 뱃지 정보 추가
        const [weeklyRanking, totalRanking] = await Promise.all([
            addBadgesToRankings(weeklyRankingRaw),
            addBadgesToRankings(totalRankingRaw)
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
        const [weeklyRankingRaw, categoryInfo] = await Promise.all([
            pagesModel.getWeeklyRankingWithDetails(10, cateNum),
            cateNum ? pagesModel.getCategoryInfo(cateNum) : null
        ]);

        const weeklyRanking = await addBadgesToRankings(weeklyRankingRaw);

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
        const [totalRankingRaw, categoryInfo] = await Promise.all([
            pagesModel.getTotalRankingWithDetails(10, cateNum),
            cateNum ? pagesModel.getCategoryInfo(cateNum) : null
        ]);
        
        const totalRanking = await addBadgesToRankings(totalRankingRaw);

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

