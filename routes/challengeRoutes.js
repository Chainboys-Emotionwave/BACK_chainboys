const express = require('express')
const challengeController = require('../controllers/challengeController');
const router = express.Router();
const auth = require('../middleware/auth'); 

router.post('/', auth, challengeController.insertChallenge);

router.get('/', challengeController.getAllChallenges);
router.get('/active', challengeController.getActiveChallenges);
router.get('/:challNum', challengeController.getChallenge);

module.exports = router;