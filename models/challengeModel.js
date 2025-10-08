const db = require('../db') //db 연결 객체

exports.insertChallenge = async (contentData) => {
    try {
        const sql = `INSERT INTO challenges
        (challName, challStartDate, challEndDate, challPrize, challDescription)
        VALUES(?,?,?,?,?)
        `
        const values = [
            contentData.challName,
            contentData.challStartDate,
            contentData.challEndDate,
            contentData.challPrize,
            contentData.challDescription
        ]

        const [rows] = await db.query(sql, values);
        return { id: rows.insertId, ...contentData};
    } catch (error) {
        throw new Error(`DB 삽입 오류 : ${error.message}`);
    }
};

exports.findAllChallenges = async () => {
    try {
        const [rows] = await db.query('SELECT * FROM challenges');
        return rows;
    } catch (error) {
        throw new Error('DB 조회 오류 : ' + error.message);
    }
};

exports.findActiveChallenges = async () => {
    try {
        const sql = `SELECT * FROM challenges
                    WHERE NOW() BETWEEN challStartDate AND challEndDate`;
        const [rows] = await db.query(sql,[]);
        return rows;
    } catch (error) {
        throw new Error('DB 조회 오류 : ' + error.message);
    }
};

exports.findChallenge = async (challNum) => {
    try {
        const [rows] = await db.query('SELECT * FROM challenges WHERE challNum = ?',[challNum]);
        return rows[0] || null;
    } catch (error) {
        throw new Error('DB 조회 오류 : ' + error.message);
    }
}

// 챌린지 블록체인 정보 업데이트
exports.updateChallengeBlockchainInfo = async (challNum, blockchainInfo) => {
    try {
        const sql = `
            UPDATE challenges 
            SET 
                blockchainTxHash = ?,
                blockchainBlockNumber = ?,
                distributionTxHash = ?,
                distributionBlockNumber = ?,
                prizeDistribution = ?,
                blockchainStatus = ?,
                distributedAt = ?
            WHERE challNum = ?
        `;
        const values = [
            blockchainInfo.txHash,
            blockchainInfo.blockNumber,
            blockchainInfo.distributionTxHash,
            blockchainInfo.distributionBlockNumber,
            JSON.stringify(blockchainInfo.prizeDistribution),
            blockchainInfo.status,
            blockchainInfo.distributedAt,
            challNum
        ];

        const [result] = await db.query(sql, values);
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error('챌린지 블록체인 정보 업데이트 실패 : ' + error.message);
    }
};

// 챌린지 블록체인 정보 조회
exports.getChallengeBlockchainInfo = async (challNum) => {
    try {
        const sql = `
            SELECT 
                challNum,
                challName,
                challPrize,
                blockchainTxHash,
                blockchainBlockNumber,
                distributionTxHash,
                distributionBlockNumber,
                prizeDistribution,
                blockchainStatus,
                distributedAt
            FROM challenges 
            WHERE challNum = ?
        `;
        const [rows] = await db.query(sql, [challNum]);
        return rows[0] || null;
    } catch (error) {
        throw new Error('챌린지 블록체인 정보 조회 실패 : ' + error.message);
    }
};

// 블록체인 상태별 챌린지 조회
exports.getChallengesByBlockchainStatus = async (status) => {
    try {
        const sql = `
            SELECT 
                challNum,
                challName,
                challPrize,
                blockchainTxHash,
                blockchainStatus,
                distributedAt
            FROM challenges 
            WHERE blockchainStatus = ?
            ORDER BY challStartDate DESC
        `;
        const [rows] = await db.query(sql, [status]);
        return rows;
    } catch (error) {
        throw new Error('블록체인 상태별 챌린지 조회 실패 : ' + error.message);
    }
};