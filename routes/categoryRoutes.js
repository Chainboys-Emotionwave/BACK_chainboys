const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');

// 모든 카테고리 조회 (공개)
router.get('/', categoryController.getAllCategories);

// 특정 카테고리 조회 (공개)
router.get('/:cateNum', categoryController.getCategory);

// 카테고리 생성 (관리자)
router.post('/', auth, categoryController.createCategory);

// 카테고리 수정 (관리자)
router.put('/:cateNum', auth, categoryController.updateCategory);

// 카테고리 삭제 (관리자)
router.delete('/:cateNum', auth, categoryController.deleteCategory);

module.exports = router;