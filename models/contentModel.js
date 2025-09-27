const db = require('../db') //db 연결 객체

exports.findAllContents = async () => {
    try {
        const [rows] = await db.query('SELECT * FROM contents');
        return rows;
    } catch (error) {
        throw new Error('콘텐츠 조회 실패 : ' + error.message);
    }
};

exports.incrementViews = async (conNum) => {
    try {
        const sql = 'UPDATE contents SET conViews = conViews + 1 where conNum = ?';
        await db.query(sql, [conNum]);
    } catch (error) {
        throw new Error('조회수 업데이트 오류 : ' + error.message);
    }
}

exports.findContent = async (conNum) => {
    try {
        const [rows] = await db.query('SELECT * FROM contents where conNum = ?', [conNum]);

        return rows[0] || null;
    } catch (error) {
        throw new Error(`컨텐츠 조회 실패 : ${error.message}`);
    }
};

exports.findContentwithCreatorId = async (userNum) => {
    try {
        const [rows] = await db.query('SELECT * FROM contents where userNum = ?', [userNum]);
        
        if (rows.length === 0) {
            return null;
        }

        return rows;
    } catch (error) {
        throw new Error(`컨텐츠 조회 실패 : ${error.message}`);
    }
};

exports.insertContent = async (contentData) => {
    try {
        const sql = `INSERT INTO contents
        (conTitle, conDescription, conUrl, userNum, cateNum, challNum)
        VALUES(?,?,?,?,?,?)
        `
        const values = [
            contentData.conTitle,
            contentData.conDescription,
            contentData.conUrl,
            contentData.userNum,
            contentData.cateNum,
            contentData.challNum
        ];

        const [rows] = await db.query(sql, values);
        return { id: rows.insertId, ...contentData};
    } catch (error) {
        throw new Error(`DB 삽입 오류 : ${error.message}`);
    }
};

exports.updateContent = async (conNum, contentData) => {
    try {
        const sql = `
            UPDATE contents
            SET conTitle = ?, conDescription = ?, conUrl = ?, cateNum = ?, challNum = ?
            WHERE conNum = ? AND userNum = ?
        `;
        const values = [
            contentData.conTitle,
            contentData.conDescription,
            contentData.conUrl,
            contentData.cateNum,
            contentData.challNum,
            conNum, // WHERE 절의 id 값
            contentData.userNum,
        ];

        const [result] = await db.query(sql, values);
        
        // 업데이트된 행 있는지 확인
        if (result.affectedRows === 0) {
            return null; 
        }

        return { conNum: conNum, ...contentData };
    } catch (error) {
        throw new Error(`DB 업데이트 오류: ${error.message}`);
    }
};

exports.deleteContent = async (conNum, userNum) => {
    try {
        const sql = `
        delete from contents
        where conNum = ? and userNum = ?
        `;
        const values = [conNum, userNum];

        const [result] = await db.query(sql, values);
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error(`DB 삭제 오류: ${error.message}`);
    }
};