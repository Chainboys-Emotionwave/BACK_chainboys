const express = require('express')
const supportController = require('../controllers/supportController');
const router = express.Router();
const auth = require('../middleware/auth'); 

router.get('/', supportController.getSupportsTotalStats);
router.get('/total', supportController.getTotalSupports);
router.get('/weekly', supportController.getWeeklySupports);
router.get('/me', auth, supportController.getMySupportStats);

module.exports = router;