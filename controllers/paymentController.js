const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
  try {
    console.log('💰 Creating payment intent');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { date, time, userInfo, reservationNumber } = req.body;
    
    if (!date || !time || !userInfo || !userInfo.email) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required booking information'
      });
    }
    
    const amount = 12500;
    const currency = 'usd';
    
    console.log('📝 Creating Stripe payment intent...');
    console.log(`Amount: $${amount / 100}`);
    console.log(`Customer: ${userInfo.email}`);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      metadata: {
        date: date,
        time: time,
        name: userInfo.name,
        email: userInfo.email,
        business_name: userInfo.business_name || 'Individual',
        message: userInfo.message || '',
        reservationNumber: reservationNumber
      },
      receipt_email: userInfo.email,
      description: `Consultation Booking - ${date} ${time}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    console.log('✅ Payment intent created successfully');
    console.log(`Payment Intent ID: ${paymentIntent.id}`);
    console.log(`Client Secret: ${paymentIntent.client_secret.substring(0, 20)}...`);
    
    const pendingBooking = {
      date: date,
      time: time,
      userInfo: userInfo,
      reservationNumber: reservationNumber,
      paymentIntentId: paymentIntent.id,
      createdAt: new Date().toISOString()
    };
    
    console.log('💾 Storing pending booking...');
    
    if (!global.pendingBookings) {
      global.pendingBookings = new Map();
    }
    global.pendingBookings.set(paymentIntent.id, pendingBooking);
    
    console.log(`✅ Pending booking stored for ${paymentIntent.id}`);
    console.log(`Total pending bookings: ${global.pendingBookings.size}`);
    
    setTimeout(() => {
      if (global.pendingBookings && global.pendingBookings.has(paymentIntent.id)) {
        console.log(`🗑️ Cleaning up expired pending booking: ${paymentIntent.id}`);
        global.pendingBookings.delete(paymentIntent.id);
      }
    }, 3600000);
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency
    });
    
  } catch (error) {
    console.error('❌ Error creating payment intent:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment intent'
    });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    console.log(`🔍 Checking payment status for: ${paymentIntentId}`);
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log(`💰 Payment status: ${paymentIntent.status}`);
    console.log(`💰 Payment amount: $${paymentIntent.amount / 100}`);
    console.log(`👤 Customer: ${paymentIntent.metadata.email}`);
    
    if (paymentIntent.status === 'succeeded') {
      console.log('✅ Payment succeeded!');
      
      const pendingBooking = global.pendingBookings?.get(paymentIntentId);
      
      if (pendingBooking) {
        console.log('📦 Found pending booking data');
        console.log('Booking details:', pendingBooking);
        
        res.json({
          success: true,
          status: 'succeeded',
          bookingData: {
            date: pendingBooking.date,
            time: pendingBooking.time,
            userInfo: pendingBooking.userInfo,
            reservationNumber: pendingBooking.reservationNumber,
            paymentIntentId: paymentIntentId
          }
        });
        
        global.pendingBookings.delete(paymentIntentId);
        console.log('🗑️ Removed pending booking from storage');
      } else {
        console.log('⚠️ No pending booking found, but payment succeeded');
        res.json({
          success: true,
          status: 'succeeded',
          bookingData: null,
          message: 'Payment succeeded but booking data not found'
        });
      }
    } else if (paymentIntent.status === 'requires_payment_method') {
      console.log('⚠️ Payment requires payment method');
      res.json({
        success: false,
        status: 'requires_payment_method',
        error: 'Payment method required'
      });
    } else if (paymentIntent.status === 'canceled') {
      console.log('🔄 Payment was canceled');
      res.json({
        success: false,
        status: 'canceled',
        error: 'Payment was canceled'
      });
    } else {
      console.log(`⚠️ Unexpected payment status: ${paymentIntent.status}`);
      res.json({
        success: false,
        status: paymentIntent.status,
        error: `Payment status: ${paymentIntent.status}`
      });
    }
    
  } catch (error) {
    console.error('❌ Error confirming payment:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const handleWebhook = async (req, res) => {
  console.log('🔔 Webhook received (simplified mode)');
  console.log('Webhook body:', req.body);
  
  res.json({ 
    received: true,
    message: 'Webhook received but not processed in simplified mode'
  });
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  handleWebhook
};