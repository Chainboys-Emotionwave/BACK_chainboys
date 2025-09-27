const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 서명 메세지 요청
router.post('/request-message', authController.requestSignatureMessage);
// 서명 검증 및 로그인
router.post('/verify-signature', authController.verifySignatureAndLogin);

module.exports = router;