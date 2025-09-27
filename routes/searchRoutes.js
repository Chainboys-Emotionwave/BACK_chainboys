const express = require('express')
const searchController = require('../controllers/searchController');
const router = express.Router();
const auth = require('../middleware/auth'); 

router.get('/', searchController.searchInTotal);
router.get('/users', searchController.searchInUsers);
router.get('/contents', searchController.searchInContents);

module.exports = router;