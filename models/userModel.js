const db = require('../db')


exports.findByUserNum = async (userNum) => {
    try {
        const [rows] = await db.query(
            `SELECT userNum, userName, userWalletAddress, profileImageNum, profileImageBackNum 
            FROM users
            WHERE userNum = ?`,
            [userNum]
        )
        return rows[0] || null;
    } catch (error) {
        console.error("DB 쿼리 오류:", error); 
        throw new Error(`유저 조회 실패: ${error.message}`)
    } 
};

exports.findContentsByUserNum = async (userNum) => {
    try {
        const sql = `SELECT * FROM contents where userNum = ?`;
        const [rows] = await db.query(sql, [userNum]);
        return rows || null;
    } catch (error) {
        throw new Error(`유저의 컨텐츠 조회 실패 : ${error.message}`);
    }
};

exports.updateUser = async (userData) => {
    try {
        const sql = `
        UPDATE users
        SET userName = ?, profileImageNum = ?, profileImageBackNum = ?
        WHERE userNum = ? AND userWalletAddress = ?
        `;
        const values = [
            userData.userName,
            userData.profileImageNum,
            userData.profileImageBackNum,
            userData.userNum,
            userData.userWalletAddress
        ];

        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) {
            return null; 
        }

        return {...userData};
    } catch (error) {
        throw new Error(`DB 업데이트 오류: ${error.message}`);
    }
};