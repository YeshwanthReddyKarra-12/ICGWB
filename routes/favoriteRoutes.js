const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, favoriteController.getUserFavorites);
router.post('/toggle', requireAuth, favoriteController.toggleFavorite);

module.exports = router;
