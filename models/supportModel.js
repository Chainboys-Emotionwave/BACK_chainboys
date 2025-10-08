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

// 블록체인 기록을 위한 응원 데이터 조회
exports.getSupportsForBlockchain = async (fromDate) => {
    try {
        const sql = `
            SELECT 
                s.supNum,
                s.conNum,
                s.supporterNum,
                s.receiverNum,
                s.supDate,
                u.userWalletAddress as supporterWalletAddress
            FROM supports s
            JOIN users u ON s.supporterNum = u.userNum
            WHERE s.supDate >= ? AND s.blockchainTxHash IS NULL
            ORDER BY s.supDate ASC
        `;
        const [rows] = await db.query(sql, [fromDate]);
        return rows;
    } catch (error) {
        throw new Error('블록체인용 응원 데이터 조회 실패 : ' + error.message);
    }
};

// 특정 콘텐츠의 응원 데이터 조회 (블록체인용)
exports.getSupportsByContentForBlockchain = async (conNum) => {
    try {
        const sql = `
            SELECT 
                s.supNum,
                s.conNum,
                s.supporterNum,
                s.receiverNum,
                s.supDate,
                u.userWalletAddress as supporterWalletAddress
            FROM supports s
            JOIN users u ON s.supporterNum = u.userNum
            WHERE s.conNum = ? AND s.blockchainTxHash IS NULL
            ORDER BY s.supDate ASC
        `;
        const [rows] = await db.query(sql, [conNum]);
        return rows;
    } catch (error) {
        throw new Error('콘텐츠별 블록체인용 응원 데이터 조회 실패 : ' + error.message);
    }
};

// 특정 기간의 응원 데이터 조회 (블록체인용)
exports.getSupportsByPeriod = async (startDate, endDate) => {
    try {
        const sql = `
            SELECT 
                s.supNum,
                s.conNum,
                s.supporterNum,
                s.receiverNum,
                s.supDate,
                u.userWalletAddress as supporterWalletAddress
            FROM supports s
            JOIN users u ON s.supporterNum = u.userNum
            WHERE s.supDate >= ? AND s.supDate <= ? AND s.blockchainTxHash IS NULL
            ORDER BY s.supDate ASC
        `;
        const [rows] = await db.query(sql, [startDate, endDate]);
        return rows;
    } catch (error) {
        throw new Error('기간별 블록체인용 응원 데이터 조회 실패 : ' + error.message);
    }
};

// 응원 블록체인 정보 업데이트
exports.updateSupportsBlockchainInfo = async (supNums, blockchainInfo) => {
    try {
        const sql = `
            UPDATE supports 
            SET 
                blockchainTxHash = ?,
                blockchainBlockNumber = ?,
                blockchainRecordedAt = ?
            WHERE supNum IN (${supNums.map(() => '?').join(',')})
        `;
        const values = [
            blockchainInfo.txHash,
            blockchainInfo.blockNumber,
            blockchainInfo.recordedAt,
            ...supNums
        ];

        const [result] = await db.query(sql, values);
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error('응원 블록체인 정보 업데이트 실패 : ' + error.message);
    }
};

// 특정 콘텐츠의 응원 데이터 조회
exports.getSupportsByContent = async (conNum) => {
    try {
        const sql = `
            SELECT 
                s.*,
                u.userWalletAddress as supporterWalletAddress
            FROM supports s
            JOIN users u ON s.supporterNum = u.userNum
            WHERE s.conNum = ?
            ORDER BY s.supDate DESC
        `;
        const [rows] = await db.query(sql, [conNum]);
        return rows;
    } catch (error) {
        throw new Error('콘텐츠별 응원 데이터 조회 실패 : ' + error.message);
    }
};

// 블록체인 기록 상태 조회
exports.getBlockchainRecordStatus = async () => {
    try {
        const sql = `
            SELECT 
                COUNT(*) as totalSupports,
                COUNT(blockchainTxHash) as recordedSupports,
                COUNT(*) - COUNT(blockchainTxHash) as unrecordedSupports
            FROM supports
        `;
        const [rows] = await db.query(sql);
        return rows[0];
    } catch (error) {
        throw new Error('블록체인 기록 상태 조회 실패 : ' + error.message);
    }
};

exports.findUserSupportStats = async (userNum) => {
    try {
        // 1. 사용자의 총 응원 수 조회
        const [totalSupportsRows] = await db.query(
            'SELECT COUNT(supNum) AS totalSupports FROM supports WHERE receiverNum = ?',
            [userNum]
        );
        const totalSupports = totalSupportsRows[0].totalSupports;

        // 2. 사용자의 주간 응원 수 조회
        const [weeklySupportsRows] = await db.query(
            'SELECT COUNT(supNum) AS weeklySupports FROM supports WHERE receiverNum = ? AND supDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
            [userNum]
        );
        const weeklySupports = weeklySupportsRows[0].weeklySupports;

        // 3. 총 순위 조회 (전체 사용자 중에서 해당 사용자의 순위)
        const [totalRankRows] = await db.query(`
            SELECT ranking FROM (
                SELECT receiverNum, COUNT(supNum) AS totalSupports,
                       ROW_NUMBER() OVER (ORDER BY COUNT(supNum) DESC) as ranking
                FROM supports
                GROUP BY receiverNum
            ) ranked_users
            WHERE receiverNum = ?
        `, [userNum]);
        const totalRank = totalRankRows.length > 0 ? totalRankRows[0].ranking : null;

        // 4. 주간 순위 조회 (주간 응원 수 기준)
        const [weeklyRankRows] = await db.query(`
            SELECT ranking FROM (
                SELECT receiverNum, COUNT(supNum) AS weeklySupports,
                       ROW_NUMBER() OVER (ORDER BY COUNT(supNum) DESC) as ranking
                FROM supports
                WHERE supDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY receiverNum
            ) ranked_users
            WHERE receiverNum = ?
        `, [userNum]);
        const weeklyRank = weeklyRankRows.length > 0 ? weeklyRankRows[0].ranking : null;

        return {
            totalSupports,
            weeklySupports,
            totalRank,
            weeklyRank
        };
    } catch (error) {
        throw new Error('사용자 응원 통계 조회 실패 : ' + error.message);
    }
};
