const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', courseController.getAllCourses);
router.get('/degree-levels', courseController.getDegreeLevels);
router.get('/:id', courseController.getCourseById);

// Admin-only endpoints
router.post('/', requireAdmin, courseController.createCourse);
router.put('/:id', requireAdmin, courseController.updateCourse);
router.delete('/:id', requireAdmin, courseController.deleteCourse);

module.exports = router;
