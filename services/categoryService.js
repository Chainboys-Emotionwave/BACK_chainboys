const categoryModel = require('../models/categoryModel');

class CategoryService {
    async getAllCategories() {
        return await categoryModel.findAll();
    }

    async getCategoryById(cateNum) {
        const category = await categoryModel.findById(cateNum);
        if (!category) {
            const error = new Error('카테고리를 찾을 수 없습니다.');
            error.status = 404;
            throw error;
        }
        return category;
    }

    async createCategory(categoryData) {
        return await categoryModel.create(categoryData);
    }

    async updateCategory(cateNum, categoryData) {
        const success = await categoryModel.update(cateNum, categoryData);
        if (!success) {
            const error = new Error('카테고리를 찾을 수 없거나 업데이트에 실패했습니다.');
            error.status = 404;
            throw error;
        }
        return { cateNum, ...categoryData };
    }

    async deleteCategory(cateNum) {
        const success = await categoryModel.delete(cateNum);
        if (!success) {
            const error = new Error('카테고리를 찾을 수 없습니다.');
            error.status = 404;
            throw error;
        }
        return true;
    }
}

module.exports = new CategoryService();
