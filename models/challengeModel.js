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