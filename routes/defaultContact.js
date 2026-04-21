const express = require("express");
const router = express.Router();
const { submitDefaultContactForm } = require("../controllers/defaultContactController");

router.post("/submit", submitDefaultContactForm);

module.exports = router;