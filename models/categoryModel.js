const db = require('../db');

class CategoryModel {
    // 모든 카테고리 조회
    async findAll() {
        try {
            const [rows] = await db.query('SELECT * FROM category ORDER BY cateNum ASC');
            return rows;
        } catch (error) {
            throw new Error(`카테고리 조회 실패: ${error.message}`);
        }
    }

    // 특정 카테고리 조회
    async findById(cateNum) {
        try {
            const [rows] = await db.query('SELECT * FROM category WHERE cateNum = ?', [cateNum]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`카테고리 조회 실패: ${error.message}`);
        }
    }

    // 카테고리 생성
    async create(categoryData) {
        try {
            const { cateName } = categoryData;
            const sql = 'INSERT INTO category (cateName) VALUES (?)';
            const [result] = await db.query(sql, [cateName]);
            return { id: result.insertId, cateName };
        } catch (error) {
            throw new Error(`카테고리 생성 실패: ${error.message}`);
        }
    }

    // 카테고리 수정
    async update(cateNum, categoryData) {
        try {
            const { cateName } = categoryData;
            const sql = 'UPDATE category SET cateName = ? WHERE cateNum = ?';
            const [result] = await db.query(sql, [cateName, cateNum]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`카테고리 수정 실패: ${error.message}`);
        }
    }

    // 카테고리 삭제
    async delete(cateNum) {
        try {
            const sql = 'DELETE FROM category WHERE cateNum = ?';
            const [result] = await db.query(sql, [cateNum]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`카테고리 삭제 실패: ${error.message}`);
        }
    }
}

module.exports = new CategoryModel();
