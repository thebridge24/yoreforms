const express = require('express');
const router = express.Router();
const {
  createOrUpdateInactiveDate,
  getAllInactiveDates,
  getInactiveDateByDate,
  deleteInactiveDate,
  updateInactiveDate,
  checkDateAvailability,
  bookSlotPublicPost,
  bookSlotPublicPut
} = require('../controllers/stackgateInactiveDateController');
const authMiddleware = require('../middleware/auth');

router.post('/dates', authMiddleware, createOrUpdateInactiveDate);
router.post('/dates/public', bookSlotPublicPost);
router.get('/dates', getAllInactiveDates);
router.get('/dates/check', checkDateAvailability);
router.get('/dates/:date', getInactiveDateByDate);
router.put('/dates/:id', authMiddleware, updateInactiveDate);
router.put('/dates/public/:id', bookSlotPublicPut);
router.delete('/dates/:id', authMiddleware, deleteInactiveDate);

module.exports = router;