const express = require('express');
const router = express.Router();
const {
  createOrUpdateInactiveDate,
  getAllInactiveDates,
  getInactiveDateByDate,
  deleteInactiveDate,
  updateInactiveDate,
  checkDateAvailability
} = require('../controllers/inactiveDateController');
const authMiddleware = require('../middleware/auth');

router.post('/dates', authMiddleware, createOrUpdateInactiveDate);
router.get('/dates', getAllInactiveDates);
router.get('/dates/check', checkDateAvailability);
router.get('/dates/:date', getInactiveDateByDate);
router.put('/dates/:id', authMiddleware, updateInactiveDate);
router.delete('/dates/:id', authMiddleware, deleteInactiveDate);

module.exports = router;