const db = require('../db');

// 전체 랭킹 통계 조회 (주간 총 응원, 누적 총 응원, 활성 창작자)
exports.getTotalRankingStats = async () => {
    try {
        const [weeklyStats, totalStats, activeCreators] = await Promise.all([
            // 주간 총 응원 수
            db.query('SELECT COUNT(supNum) AS weeklyTotalSupports FROM supports WHERE supDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)'),
            
            // 누적 총 응원 수
            db.query('SELECT COUNT(supNum) AS totalSupports FROM supports'),
            
            // 활성 창작자 수 (최근 7일간 콘텐츠를 올린 사용자)
            db.query(`
                SELECT COUNT(DISTINCT userNum) AS activeCreators 
                FROM contents 
                WHERE conDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            `)
        ]);

        return {
            weeklyTotalSupports: weeklyStats[0][0].weeklyTotalSupports,
            totalSupports: totalStats[0][0].totalSupports,
            activeCreators: activeCreators[0][0].activeCreators
        };
    } catch (error) {
        throw new Error('전체 랭킹 통계 조회 실패 : ' + error.message);
    }
};

// 주간 랭킹 조회 (상위 N위)
exports.getWeeklyRanking = async (limit) => {
    try {
        const sql = `
            SELECT 
                u.userNum,
                u.userName,
                u.profileImageNum,
                u.profileImageBackNum,
                COUNT(s.supNum) AS weeklySupports,
                ROW_NUMBER() OVER (ORDER BY COUNT(s.supNum) DESC) as ranking
            FROM users u
            LEFT JOIN supports s ON u.userNum = s.receiverNum 
                AND s.supDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY u.userNum, u.userName, u.profileImageNum, u.profileImageBackNum
            HAVING COUNT(s.supNum) > 0
            ORDER BY weeklySupports DESC
            LIMIT ?
        `;
        const [rows] = await db.query(sql, [limit]);
        return rows;
    } catch (error) {
        throw new Error('주간 랭킹 조회 실패 : ' + error.message);
    }
};

// 전체 랭킹 조회 (상위 N위)
exports.getTotalRanking = async (limit) => {
    try {
        const sql = `
            SELECT 
                u.userNum,
                u.userName,
                u.profileImageNum,
                u.profileImageBackNum,
                COUNT(s.supNum) AS totalSupports,
                ROW_NUMBER() OVER (ORDER BY COUNT(s.supNum) DESC) as ranking
            FROM users u
            LEFT JOIN supports s ON u.userNum = s.receiverNum
            GROUP BY u.userNum, u.userName, u.profileImageNum, u.profileImageBackNum
            HAVING COUNT(s.supNum) > 0
            ORDER BY totalSupports DESC
            LIMIT ?
        `;
        const [rows] = await db.query(sql, [limit]);
        return rows;
    } catch (error) {
        throw new Error('전체 랭킹 조회 실패 : ' + error.message);
    }
};

// 사용자 개인 랭킹 통계 조회
exports.getUserRankingStats = async (userNum) => {
    try {
        // 사용자의 총/주간 응원 수 및 순위 조회
        const [totalStats, weeklyStats] = await Promise.all([
            // 총 순위 및 응원 수
            db.query(`
                SELECT ranking, totalSupports FROM (
                    SELECT receiverNum, COUNT(supNum) AS totalSupports,
                           ROW_NUMBER() OVER (ORDER BY COUNT(supNum) DESC) as ranking
                    FROM supports
                    GROUP BY receiverNum
                ) ranked_users
                WHERE receiverNum = ?
            `, [userNum]),
            
            // 주간 순위 및 응원 수
            db.query(`
                SELECT ranking, weeklySupports FROM (
                    SELECT receiverNum, COUNT(supNum) AS weeklySupports,
                           ROW_NUMBER() OVER (ORDER BY COUNT(supNum) DESC) as ranking
                    FROM supports
                    WHERE supDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                    GROUP BY receiverNum
                ) ranked_users
                WHERE receiverNum = ?
            `, [userNum])
        ]);

        return {
            totalRank: totalStats[0].length > 0 ? totalStats[0][0].ranking : null,
            totalSupports: totalStats[0].length > 0 ? totalStats[0][0].totalSupports : 0,
            weeklyRank: weeklyStats[0].length > 0 ? weeklyStats[0][0].ranking : null,
            weeklySupports: weeklyStats[0].length > 0 ? weeklyStats[0][0].weeklySupports : 0
        };
    } catch (error) {
        throw new Error('사용자 랭킹 통계 조회 실패 : ' + error.message);
    }
};

// 카테고리별 통계 조회
exports.getCategoryStats = async () => {
    try {
        const sql = `
            SELECT 
                c.cateNum,
                c.cateName,
                COUNT(DISTINCT s.receiverNum) AS uniqueReceivers,
                COUNT(s.supNum) AS totalSupports,
                ROUND(COUNT(s.supNum) * 100.0 / (SELECT COUNT(*) FROM supports), 2) AS percentage
            FROM category c
            LEFT JOIN contents con ON c.cateNum = con.cateNum
            LEFT JOIN supports s ON con.conNum = s.conNum
            GROUP BY c.cateNum, c.cateName
            ORDER BY totalSupports DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    } catch (error) {
        throw new Error('카테고리별 통계 조회 실패 : ' + error.message);
    }
};

// 주간 랭킹 상세 조회 (프로필 정보 포함)
exports.getWeeklyRankingWithDetails = async (limit, cateNum) => {
    try {
        let whereClause = '';
        let queryParams = [limit];

        if (cateNum) {
            whereClause = 'AND con.cateNum = ?';
            queryParams.unshift(cateNum);
        }

        const sql = `
            SELECT 
                u.userNum,
                u.userName,
                u.profileImageNum,
                u.profileImageBackNum,
                COUNT(s.supNum) AS weeklySupports,
                COUNT(DISTINCT con.conNum) AS contentCount,
                ROW_NUMBER() OVER (ORDER BY COUNT(s.supNum) DESC) as ranking
            FROM users u
            LEFT JOIN supports s ON u.userNum = s.receiverNum 
                AND s.supDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            LEFT JOIN contents con ON u.userNum = con.userNum ${whereClause}
            GROUP BY u.userNum, u.userName, u.profileImageNum, u.profileImageBackNum
            HAVING COUNT(s.supNum) > 0
            ORDER BY weeklySupports DESC
            LIMIT ?
        `;
        const [rows] = await db.query(sql, queryParams);
        return rows;
    } catch (error) {
        throw new Error('주간 랭킹 상세 조회 실패 : ' + error.message);
    }
};

// 전체 랭킹 상세 조회 (프로필 정보 포함)
exports.getTotalRankingWithDetails = async (limit, cateNum) => {
    try {
        let whereClause = '';
        let queryParams = [limit];

        if (cateNum) {
            whereClause = 'AND con.cateNum = ?';
            queryParams.unshift(cateNum);
        }

        const sql = `
            SELECT 
                u.userNum,
                u.userName,
                u.profileImageNum,
                u.profileImageBackNum,
                COUNT(s.supNum) AS totalSupports,
                COUNT(DISTINCT con.conNum) AS contentCount,
                ROW_NUMBER() OVER (ORDER BY COUNT(s.supNum) DESC) as ranking
            FROM users u
            LEFT JOIN supports s ON u.userNum = s.receiverNum
            LEFT JOIN contents con ON u.userNum = con.userNum ${whereClause}
            GROUP BY u.userNum, u.userName, u.profileImageNum, u.profileImageBackNum
            HAVING COUNT(s.supNum) > 0
            ORDER BY totalSupports DESC
            LIMIT ?
        `;
        const [rows] = await db.query(sql, queryParams);
        return rows;
    } catch (error) {
        throw new Error('전체 랭킹 상세 조회 실패 : ' + error.message);
    }
};

// 카테고리 정보 조회
exports.getCategoryInfo = async (cateNum) => {
    try {
        const sql = 'SELECT cateNum, cateName FROM category WHERE cateNum = ?';
        const [rows] = await db.query(sql, [cateNum]);
        return rows[0] || null;
    } catch (error) {
        throw new Error('카테고리 정보 조회 실패 : ' + error.message);
    }
};

// 진행 중인 축제 목록 조회
exports.getActiveFestivals = async () => {
    try {
        const sql = `
            SELECT 
                c.challNum,
                c.challName,
                c.challDescription,
                c.challStartDate,
                c.challEndDate,
                c.challPrize,
                COUNT(DISTINCT con.conNum) AS participantCount,
                CASE 
                    WHEN NOW() BETWEEN c.challStartDate AND c.challEndDate THEN '진행중'
                    WHEN NOW() < c.challStartDate THEN '시작전'
                    ELSE '종료'
                END AS status
            FROM challenges c
            LEFT JOIN contents con ON c.challNum = con.challNum
            GROUP BY c.challNum, c.challName, c.challDescription, c.challStartDate, c.challEndDate, c.challPrize
            ORDER BY c.challStartDate DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    } catch (error) {
        throw new Error('진행 중인 축제 목록 조회 실패 : ' + error.message);
    }
};

// 특정 축제 정보 조회
exports.getFestivalInfo = async (challNum) => {
    try {
        const sql = `
            SELECT 
                c.challNum,
                c.challName,
                c.challDescription,
                c.challStartDate,
                c.challEndDate,
                c.challPrize,
                COUNT(DISTINCT con.conNum) AS participantCount,
                CASE 
                    WHEN NOW() BETWEEN c.challStartDate AND c.challEndDate THEN '진행중'
                    WHEN NOW() < c.challStartDate THEN '시작전'
                    ELSE '종료'
                END AS status
            FROM challenges c
            LEFT JOIN contents con ON c.challNum = con.challNum
            WHERE c.challNum = ?
            GROUP BY c.challNum, c.challName, c.challDescription, c.challStartDate, c.challEndDate, c.challPrize
        `;
        const [rows] = await db.query(sql, [challNum]);
        return rows[0] || null;
    } catch (error) {
        throw new Error('축제 정보 조회 실패 : ' + error.message);
    }
};

// 축제에 참여한 콘텐츠 목록 조회
exports.getFestivalParticipatingContents = async (challNum) => {
    try {
        const sql = `
            SELECT 
                con.conNum,
                con.conTitle,
                con.conDate,
                con.conSupports,
                u.userNum,
                u.userName,
                u.profileImageNum,
                u.profileImageBackNum,
                cat.cateNum,
                cat.cateName
            FROM contents con
            JOIN users u ON con.userNum = u.userNum
            LEFT JOIN category cat ON con.cateNum = cat.cateNum
            WHERE con.challNum = ?
            ORDER BY con.conDate DESC
        `;
        const [rows] = await db.query(sql, [challNum]);
        return rows;
    } catch (error) {
        throw new Error('축제 참여 콘텐츠 조회 실패 : ' + error.message);
    }
};
