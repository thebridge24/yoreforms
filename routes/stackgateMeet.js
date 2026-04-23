const express = require("express");
const router = express.Router();
const { 
  submitConsultationForm,
  submitConsultationAfterPayment 
} = require("../controllers/stackgateMeetController");

router.post("/schedule", submitConsultationForm);
router.post("/schedule-after-payment", submitConsultationAfterPayment);

module.exports = router;