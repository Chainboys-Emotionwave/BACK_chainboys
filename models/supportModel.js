const db = require('../db') //db 연결 객체


exports.findSupportsTotalStats = async () => {
    try {

        const [totalCountRow, weeklyCountRow, uniqueReceiversRow] = await Promise.all([
            // 쿼리 1: 전체 총 응원 수
            db.query('SELECT COUNT(supNum) AS totalSupportsCount FROM supports'),
            
            // 쿼리 2: 주간 응원 수 (supDate 인덱스 활용)
            db.query('SELECT COUNT(supNum) AS weeklySupportsCount FROM supports WHERE supDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)'),
            
            // 쿼리 3: 응원 받은 사람 수
            db.query('SELECT COUNT(DISTINCT receiverNum) AS totalUniqueReceivers FROM supports')
        ]);
        
        // 결과들을 추출하여 하나의 객체로 합쳐 반환
        return {
            totalSupportsCount: totalCountRow[0][0].totalSupportsCount,
            weeklySupportsCount: weeklyCountRow[0][0].weeklySupportsCount,
            totalUniqueReceivers: uniqueReceiversRow[0][0].totalUniqueReceivers
        };
    } catch (error) {
        throw new Error('DB 조회 실패 : ' + error.message);
    }
};


exports.findTotalSupports = async (cateNum) => {
    try {
        let whereClause = '';
        let queryParams = [];

        // cateNum이 전달되면 WHERE 절을 추가
        if (cateNum) {
            whereClause = 'WHERE conNum IN (SELECT conNum FROM contents WHERE cateNum = ?)';
            queryParams.push(cateNum);
        }

        const sql = `
        SELECT receiverNum AS userNum, COUNT(supNum) AS totalSupports
        FROM supports
        ${whereClause}
        GROUP BY receiverNum
        ORDER BY totalSupports DESC
        LIMIT 10
        `;
        const [rows] = await db.query(sql, queryParams);
        
        return rows;
    } catch (error) {
        throw new Error('DB 조회 실패 : ' + error.message);
    }
};

exports.findWeeklySupports = async (cateNum) => {
    try {
        let whereClause = '';
        let queryParams = [];

        // cateNum이 전달되면 WHERE 절을 추가
        if (cateNum) {
            whereClause = 'AND conNum IN (SELECT conNum FROM contents WHERE cateNum = ?)';
            queryParams.push(cateNum);
        }

        const sql = `
        SELECT receiverNum AS userNum, COUNT(supNum) AS totalSupports
        FROM supports
        WHERE supDate >= DATE_SUB(NOW(), INTERVAL 7 DAY) ${whereClause}
        GROUP BY receiverNum
        ORDER BY totalSupports DESC
        LIMIT 10
        `;
        const [rows] = await db.query(sql, queryParams);
        
        return rows;
    } catch (error) {
        throw new Error('DB 조회 실패 : ' + error.message);
    }
};
