const express = require("express");
const router = express.Router();
const { submitConsultationForm } = require("../controllers/meetController");

router.post("/schedule", submitConsultationForm);

module.exports = router;