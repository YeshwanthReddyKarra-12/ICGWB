const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', careerController.getAllCareers);
router.get('/categories', careerController.getCategories);
router.get('/streams', careerController.getStreams);
router.get('/:id', careerController.getCareerById);

// Admin-only endpoints
router.post('/', requireAdmin, careerController.createCareer);
router.put('/:id', requireAdmin, careerController.updateCareer);
router.delete('/:id', requireAdmin, careerController.deleteCareer);

module.exports = router;
