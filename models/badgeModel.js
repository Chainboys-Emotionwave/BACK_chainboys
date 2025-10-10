const db = require('../db');

// 모든 뱃지 조회
exports.findAllBadges = async () => {
    try {
        const [rows] = await db.query('SELECT * FROM badges ORDER BY badgesNum ASC');
        return rows;
    } catch (error) {
        throw new Error(`뱃지 조회 실패: ${error.message}`);
    }
};

// 특정 뱃지 조회
exports.findBadgeById = async (badgesNum) => {
    try {
        const [rows] = await db.query('SELECT * FROM badges WHERE badgesNum = ?', [badgesNum]);
        return rows[0] || null;
    } catch (error) {
        throw new Error(`뱃지 조회 실패: ${error.message}`);
    }
};

// 뱃지 생성 (관리자용)
exports.createBadge = async (badgeData) => {
    try {
        const { badgesName, badgesDescription } = badgeData;
        const sql = 'INSERT INTO badges (badgesName, badgesDescription) VALUES (?, ?)';
        const [result] = await db.query(sql, [badgesName, badgesDescription]);
        return { id: result.insertId, ...badgeData };
    } catch (error) {
        throw new Error(`뱃지 생성 실패: ${error.message}`);
    }
};

// 뱃지 수정 (관리자용)
exports.updateBadge = async (badgesNum, badgeData) => {
    try {
        const { badgesName, badgesDescription } = badgeData;
        const sql = 'UPDATE badges SET badgesName = ?, badgesDescription = ? WHERE badgesNum = ?';
        const [result] = await db.query(sql, [badgesName, badgesDescription, badgesNum]);
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error(`뱃지 수정 실패: ${error.message}`);
    }
};

// 뱃지 삭제 (관리자용)
exports.deleteBadge = async (badgesNum) => {
    try {
        const sql = 'DELETE FROM badges WHERE badgesNum = ?';
        const [result] = await db.query(sql, [badgesNum]);
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error(`뱃지 삭제 실패: ${error.message}`);
    }
};

// 사용자가 보유한 뱃지 조회
exports.findUserBadges = async (userNum) => {
    try {
        const sql = `
            SELECT b.badgesNum, b.badgesName, b.badgesDescription
            FROM userBadges ub
            JOIN badges b ON ub.badgesNum = b.badgesNum
            WHERE ub.userNum = ?
            ORDER BY b.badgesNum ASC
        `;
        const [rows] = await db.query(sql, [userNum]);
        return rows;
    } catch (error) {
        throw new Error(`사용자 뱃지 조회 실패: ${error.message}`);
    }
};

// 사용자에게 뱃지 부여
exports.grantBadgeToUser = async (userNum, badgesNum) => {
    try {
        const sql = 'INSERT INTO userBadges (userNum, badgesNum) VALUES (?, ?)';
        await db.query(sql, [userNum, badgesNum]);
        return true;
    } catch (error) {
        // 이미 뱃지가 있는 경우 등 중복 오류는 무시
        if (error.code === 'ER_DUP_ENTRY') {
            return false;
        }
        throw new Error(`뱃지 부여 실패: ${error.message}`);
    }
};

// 사용자가 특정 뱃지를 가지고 있는지 확인
exports.checkUserHasBadge = async (userNum, badgesNum) => {
    try {
        const sql = 'SELECT * FROM userBadges WHERE userNum = ? AND badgesNum = ?';
        const [rows] = await db.query(sql, [userNum, badgesNum]);
        return rows.length > 0;
    } catch (error) {
        throw new Error(`사용자 뱃지 확인 실패: ${error.message}`);
    }
};