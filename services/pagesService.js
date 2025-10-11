const pagesModel = require('../models/pagesModel');
const badgeModel = require('../models/badgeModel'); 
const userModel = require('../models/userModel'); 

// 홈 페이지 데이터 조회
exports.getHomePageData = async (userNum) => {
    try {
        const promises = [
            pagesModel.getWeeklyContentRankingForHome(),
            badgeModel.findAllBadges(),
            pagesModel.getRandomContentsForHome(4),
            pagesModel.getActiveFestivalsForHome()
        ];

        // userNum이 있는 경우 (로그인 한 경우) 사용자 정보와 사용자 뱃지 조회 프로미스를 추가
        if (userNum) {
            promises.push(userModel.findByUserNum(userNum));
            promises.push(badgeModel.findUserBadges(userNum)); // 사용자 뱃지 조회 추가
        }

        const results = await Promise.all(promises);

        const homeData = {
            ranking: results[0],
            badges: results[1],
            randomContents: results[2],
            festivals: results[3]
        };

        // 로그인한 사용자 정보와 뱃지가 있으면 응답에 추가
        if (userNum && results.length > 5) {
            const userInfo = results[4];
            const userBadges = results[5];
            
            if (userInfo) {
                userInfo.badges = userBadges;
                homeData.userInfo = userInfo;
            }
        }

        return homeData;

    } catch (error) {
        throw new Error('홈 페이지 데이터 조회 실패: ' + error.message);
    }
};

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

// 내 집 페이지(컬렉션) 데이터 조회
exports.getMyCollectionPageData = async (userNum) => {
    try {
        const [
            profileData,
            contents,
            rewards,
            badges
        ] = await Promise.all([
            pagesModel.getUserProfileForCollection(userNum),
            pagesModel.getUserContentsForCollection(userNum),
            pagesModel.getUserRewardsForCollection(userNum),
            badgeModel.findUserBadges(userNum)
        ]);

        if (!profileData) {
            throw new Error('사용자 정보를 찾을 수 없습니다.');
        }

        // 데이터 조합
        const collectionData = {
            profile: {
                userName: profileData.userName,
                userWalletAddress: profileData.userWalletAddress,
                totalReward: profileData.totalReward,
                totalSupports: profileData.totalSupports,
                totalBadges: profileData.totalBadges,
                profileImageNum: profileData.profileImageNum,
                profileImageBackNum: profileData.profileImageBackNum // profileImageColorId 대신 사용
            },
            contents: contents || [],
            rewards: rewards || [],
            badges: badges || [],
            stats: {
                totalReward: profileData.totalReward,
                totalSupports: profileData.totalSupports,
                totalBadges: profileData.totalBadges
            }
        };

        return collectionData;
    } catch (error) {
        throw new Error('내 집 페이지 데이터 조회 실패: ' + error.message);
    }
};

// 창작자 프로필 페이지 데이터 조회
exports.getCreatorProfilePageData = async (userNum) => {
    try {
        const [
            user,
            supportStats,
            contents,
            badges
        ] = await Promise.all([
            userModel.findByUserNum(userNum),
            pagesModel.getCreatorSupportStats(userNum),
            pagesModel.getUserContentsForCollection(userNum), // 콘텐츠 목록 조회 재사용
            badgeModel.findUserBadges(userNum)
        ]);

        // 사용자가 없는 경우를 대비
        if (!user) {
            return { user: null };
        }

        return {
            user,
            stats: {
                weeklySupports: supportStats.weeklySupports,
                totalSupports: supportStats.totalSupports,
                contentCount: contents ? contents.length : 0,
            },
            contents,
            badges
        };
    } catch (error) {
        throw new Error('창작자 프로필 데이터 조회 실패: ' + error.message);
    }
};