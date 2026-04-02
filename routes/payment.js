const express = require('express');
const router = express.Router();
const { createPaymentIntent, handleWebhook, confirmPayment } = require('../controllers/paymentController');

router.post('/create-payment-intent', createPaymentIntent);
router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);
router.get('/confirm/:paymentIntentId', confirmPayment);

module.exports = router;