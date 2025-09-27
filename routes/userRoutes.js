const express = require('express')
const userController = require('../controllers/userController');
const router = express.Router();
const auth = require('../middleware/auth'); 

router.get('/me', auth, userController.getMyData);
router.put('/me',auth, userController.updateMyData);

router.get('/:userNum', userController.getUser);

module.exports = router;