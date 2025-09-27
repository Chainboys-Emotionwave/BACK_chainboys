const express = require('express')
const contentController = require('../controllers/contentController');
const router = express.Router();
const auth = require('../middleware/auth'); 

router.get('/', contentController.getAllContents);
router.get('/:conNum', contentController.getContent);
router.get('/creator/:userNum', contentController.getContentwithCreatorId);

// 로그인 해야 가능
router.post('/', auth, contentController.insertContent);
router.put('/:conNum', auth, contentController.updateContent);
router.delete('/:conNum', auth, contentController.deleteContent);


module.exports = router;