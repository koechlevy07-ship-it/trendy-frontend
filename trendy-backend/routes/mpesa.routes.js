const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmation, sendAdminNewOrder } = require('../services/emailService');

router.get('/ping', (req, res) => res.json({ pong: true }));

router.post('/callback', async (req, res) => {
    try {
        const callbackData = req.body.Body?.stkCallback;
        if (!callbackData) {
            console.error('M-Pesa callback: missing stkCallback');
            return res.json({ ResultCode: 0, ResultDesc: 'OK' });
        }

        const checkoutRequestId = callbackData.CheckoutRequestID;
        const resultCode = callbackData.ResultCode;
        const resultDesc = callbackData.ResultDesc;

        console.log('M-Pesa callback:', { checkoutRequestId, resultCode, resultDesc });

        const order = await Order.findOne({ 'paymentDetails.mpesaCheckoutRequestId': checkoutRequestId });
        if (!order) {
            console.error('M-Pesa callback: order not found for', checkoutRequestId);
            return res.json({ ResultCode: 0, ResultDesc: 'OK' });
        }

        if (resultCode === 0) {
            const items = callbackData.CallbackMetadata?.Item || [];
            const mpesaReceipt = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value || '';
            const amount = items.find(i => i.Name === 'Amount')?.Value || order.total;
            const phone = items.find(i => i.Name === 'PhoneNumber')?.Value || '';

            order.paymentDetails.transactionId = mpesaReceipt;
            order.paymentDetails.paymentRef = mpesaReceipt;
            order.paymentDetails.paidAt = new Date();
            order.paymentDetails.paymentStatus = 'completed';
            order.paymentDetails.providerResponse = callbackData;
            if (order.status === 'pending') order.status = 'confirmed';
            order.timeline.push({ status: order.status, note: `M-Pesa payment confirmed (${mpesaReceipt})`, timestamp: new Date() });
            await order.save();

            const user = await User.findById(order.user).select('name email');
            if (user) sendOrderConfirmation(order, user).catch(() => {});
            if (user) sendAdminNewOrder(order, user).catch(() => {});
        } else {
            order.paymentDetails.paymentStatus = 'failed';
            order.paymentDetails.providerResponse = callbackData;
            order.timeline.push({ status: order.status, note: `M-Pesa payment failed: ${resultDesc}`, timestamp: new Date() });
            await order.save();
        }

        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (err) {
        console.error('M-Pesa callback error:', err);
        res.json({ ResultCode: 0, ResultDesc: 'OK' });
    }
});

module.exports = router;
