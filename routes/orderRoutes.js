const express = require('express');
const { requireAuth } = require('../orderValidators');
const { ApiError } = require('../ApiError');
const { sendSuccess } = require('../apiResponse');
const { Order } = require('../cartRoutes');
const { Payment } = require('../categoryRoutes');

const router = express.Router();
router.use(requireAuth);

router.post('/:id/pay-mpesa', async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const orderId = req.params.id;
    if (!phoneNumber) throw new ApiError(400, 'Phone number is required');
    const order = await Order.findOne({ _id: orderId, customer: req.user._id });
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.status !== 'pending') {
      throw new ApiError(409, `Order is "${order.status}" — cannot be paid`);
    }
    const payment = await Payment.create({
      order: order._id, method: 'mpesa', amount: order.total, currency: 'KES',
      status: 'pending', phone: phoneNumber,
    });
    return sendSuccess(res, 202, {
      message: 'Payment prompt sent. Check your phone for the M-Pesa PIN prompt.',
      paymentId: payment._id,
    });
  } catch (err) { next(err); }
});

router.post('/:id/verify-payment', async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) throw new ApiError(404, 'Order not found');
    const payment = await Payment.findOne({ order: order._id }).sort({ createdAt: -1 });
    return sendSuccess(res, 200, { data: { status: payment ? payment.status : 'pending' } });
  } catch (err) { next(err); }
});

module.exports = router;
