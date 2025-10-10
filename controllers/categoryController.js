const categoryService = require('../services/categoryService');

class CategoryController {
    async getAllCategories(req, res) {
        try {
            const categories = await categoryService.getAllCategories();
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getCategory(req, res) {
        try {
            const { cateNum } = req.params;
            const category = await categoryService.getCategoryById(cateNum);
            res.status(200).json(category);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async createCategory(req, res) {
        try {
            if (req.userData.role !== 'admin') {
                return res.status(403).json({ message: '관리자만 접근 가능합니다.' });
            }
            const newCategory = await categoryService.createCategory(req.body);
            res.status(201).json(newCategory);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateCategory(req, res) {
        try {
            if (req.userData.role !== 'admin') {
                return res.status(403).json({ message: '관리자만 접근 가능합니다.' });
            }
            const { cateNum } = req.params;
            const updatedCategory = await categoryService.updateCategory(cateNum, req.body);
            res.status(200).json(updatedCategory);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async deleteCategory(req, res) {
        try {
            if (req.userData.role !== 'admin') {
                return res.status(403).json({ message: '관리자만 접근 가능합니다.' });
            }
            const { cateNum } = req.params;
            await categoryService.deleteCategory(cateNum);
            res.status(200).json({ message: '카테고리가 성공적으로 삭제되었습니다.' });
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }
}

module.exports = new CategoryController();
