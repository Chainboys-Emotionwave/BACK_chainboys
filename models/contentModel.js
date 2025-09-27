const db = require('../db') //db 연결 객체


exports.findAllContents = async ({ sort, limit, offset }) => {
    try {
        let orderByClause;

        switch (sort) {
            case 'popular-supports':
                // 응원 횟수가 많은 순서 (내림차순)
                orderByClause = 'c.conSupports DESC';
                break;
            case 'popular-views':
                // 응원 횟수가 많은 순서 (내림차순)
                orderByClause = 'c.conViews DESC';
                break;
            case 'latest':
            default:
                // 생성일이 최신인 순서 (내림차순)
                orderByClause = 'c.conDate DESC';
                break;
        }

        // 2. 기본 쿼리 및 페이지네이션 설정
        const sql = `
            SELECT 
                c.*, 
                u.userName AS userName
            FROM contents c
            JOIN users u ON c.userNum = u.userNum
            ORDER BY ${orderByClause}
            LIMIT ? OFFSET ?;
        `;
        
        // 3. 쿼리 실행
        // limit과 offset은 항상 숫자로 전달되므로, ? 플레이스홀더를 사용해 SQL 인젝션을 방지합니다.
        const [rows] = await db.query(sql, [limit, offset]);
        
        // 4. (선택적) 전체 콘텐츠 개수 조회 쿼리 (페이지네이션 UI 구성을 위해 필요)
        const [totalRows] = await db.query('SELECT COUNT(conNum) AS totalCount FROM contents');
        const totalCount = totalRows[0].totalCount;

        return { contents: rows, totalCount };
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

exports.findContentsWithUserNum = async (userNum) => {
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


exports.findContentsWithChallNum = async (challNum) => {
    try {
        const [rows] = await db.query('SELECT * FROM contents where challNum = ?', [challNum]);
        
        if (rows.length === 0) {
            return null;
        }

        return rows;
    } catch (error) {
        throw new Error(`컨텐츠 조회 실패 : ${error.message}`);
    }
};

exports.findContentsWithCateNum = async (cateNum) => {
    try {
        const [rows] = await db.query('SELECT * FROM contents where cateNum = ?', [cateNum]);
        
        if (rows.length === 0) {
            return null;
        }

        return rows;
    } catch (error) {
        throw new Error(`컨텐츠 조회 실패 : ${error.message}`);
    }
};


exports.findContentsWithQuery = async (cateNum) => {
    try {
        const [rows] = await db.query('SELECT * FROM contents where cateNum = ?', [cateNum]);
        
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