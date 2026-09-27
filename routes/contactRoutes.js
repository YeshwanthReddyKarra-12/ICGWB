const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post('/', contactController.submitRequest);
router.get('/', requireAdmin, contactController.getAllRequests);
router.get('/my', requireAuth, contactController.getMyRequests);
router.put('/:id', requireAdmin, contactController.updateRequest);
router.delete('/:id', requireAdmin, contactController.deleteRequest);

module.exports = router;
