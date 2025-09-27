const db = require('../db')


exports.searchInUsers = async (query) => {
    try {
        const sql = `
        SELECT userNum, userName, profileImageNum, profileImageBackNum 
        FROM users
        WHERE userName like CONCAT('%', ?, '%')
        `;
        const [rows] = await db.query(sql, [query]);
        return rows;
    } catch (error) {
        throw new Error('유저 검색 실패 : ' + error.message);
    }
};


exports.searchInContents = async (query) => {
    try {
        const sql = `
        SELECT *
        FROM contents
        WHERE conTitle like CONCAT('%', ?, '%') or conDescription like CONCAT('%', ?, '%')
        `;
        const [rows] = await db.query(sql, [query, query]);
        return rows;
    } catch (error) {
        throw new Error('유저 검색 실패 : ' + error.message);
    }
};