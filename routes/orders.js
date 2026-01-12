const express = require('express');
const router = express.Router();

const Order = require('../models/Order');
const Gig = require('../models/Gig');
const { isAuthenticated, isClient } = require('../middleware/auth');

// POST /orders - Create a new order
router.post('/', isAuthenticated, isClient, async (req, res) => {
  try {
    const { gigId, requirements } = req.body;

    // 1. Fetch Gig first (Fail fast if it doesn't exist)
    const gig = await Gig.findById(gigId).lean();
    
    if (!gigId) {
      return res.status(400).send('gigId is required');
    }

    // 2. Consolidated Validation
    if (!gig || gig.status === 'deleted') {
      return res.status(404).send('Gig not found');
    }
    if (!requirements || requirements.trim().length < 10) {
      return res.status(400).send('must be at least 10 characters');
    }

    // 3. Calculate Delivery Date
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (gig.deliveryTime || 1));

    // 4. Create Order (One-step creation)
    await Order.create({
      gigId: gig._id,
      clientId: req.session.user._id,
      freelancerId: gig.freelancerId,
      status: 'pending',
      totalPrice: gig.price,
      requirements: requirements.trim(),
      deliveryDate
    });

    // res.redirect('/views/orders/client-orders.ejs');  ////////////////////////////////////
    res.redirect('/orders/client'); 
    // res.render('orders/client', { title: 'My Orders', orders });

  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).render('500', { title: 'Server Error' });
  }
});

module.exports = router;
//GET/orders/client - Client orders

router.get('/client', isAuthenticated, isClient, async (req, res) => {
  try {
    const orders = await Order.find({ clientId: req.session.user._id })
      .populate('gigId', 'title')
      .populate('freelancerId', 'username')
      .sort({ createdAt: -1 })
      .lean();

    return res.render('orders/client', {
      title: 'My Orders - CareFreelancer',
      orders
    });
  } catch (err) {
    console.error('Client orders error:', err);
    return res.status(500).render('500', { title: 'Server Error' });
  }
});
 
//GET/orders/freelancer - Freelancer orders
const { isAuthenticated, isFreelancer } = require('../middleware/auth');
const Order = require('../models/Order');

router.get('/freelancer', isAuthenticated, isFreelancer, async (req, res) => {
  try {
    const orders = await Order.find({ freelancerId: req.session.user._id })
      .populate('gigId', 'title')
      .populate('clientId', 'username')
      .sort({ createdAt: -1 })
      .lean();

    return res.render('orders/freelancer', {
      title: 'Orders Received - CareFreelancer',
      orders
    });
  } catch (err) {
    console.error('Freelancer orders error:', err);
    return res.status(500).render('500', { title: 'Server Error' });
  }
});


//POST/orders - Create new order
const { isAuthenticated } = require('../middleware/auth');
const Order = require('../models/Order');

router.post('/:id', isAuthenticated, async (req, res) => {
  try {
    const { action } = req.body;
    const user = req.session.user;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).render('404', { title: 'Order Not Found' });
    }

    const isClientUser = order.clientId.toString() === user._id.toString();
    const isFreelancerUser = order.freelancerId.toString() === user._id.toString();

    // Access control: only the client or the freelancer in this order can update it
    if (!isClientUser && !isFreelancerUser) {
      return res.status(403).send('Access denied');
    }

    // Client actions
    if (action === 'cancel') {
      if (!isClientUser) return res.status(403).send('Clients only');
      if (order.status !== 'pending') return res.status(400).send('Only pending orders can be cancelled');

      order.status = 'cancelled';
      await order.save();
      return res.redirect('/orders/client');
    }

    // Freelancer actions
    if (action === 'start') {
      if (!isFreelancerUser) return res.status(403).send('Freelancers only');
      if (order.status !== 'pending') return res.status(400).send('Only pending orders can be started');

      order.status = 'in-progress';
      await order.save();
      return res.redirect('/orders/freelancer');
    }

    if (action === 'complete') {
      if (!isFreelancerUser) return res.status(403).send('Freelancers only');
      if (order.status !== 'in-progress') return res.status(400).send('Only in-progress orders can be completed');

      order.status = 'completed';
      order.completedDate = new Date();
      await order.save();
      return res.redirect('/orders/freelancer');
    }

    return res.status(400).send('Invalid action');
  } catch (err) {
    console.error('Update order status error:', err);
    return res.status(500).render('500', { title: 'Server Error' });
  }
});


// GET /orders/:id - Show order details
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;

    const order = await Order.findById(req.params.id)
      .populate('gigId', 'title')
      .populate('clientId', 'username')
      .populate('freelancerId', 'username')
      .lean();

    if (!order) {
      return res.status(404).render('404', { title: 'Order Not Found' });
    }

    const isClientUser =
      order.clientId && order.clientId._id.toString() === user._id.toString();
    const isFreelancerUser =
      order.freelancerId && order.freelancerId._id.toString() === user._id.toString();

    if (!isClientUser && !isFreelancerUser) {
      return res.status(403).send('Access denied');
    }

    return res.render('orders/details', {
      title: 'Order Details - CareFreelancer',
      order
    });
  } catch (err) {
    console.error('Order details error:', err);
    return res.status(500).render('500', { title: 'Server Error' });
  }
});


// POST /orders/:id - Update order status
router.post('/:id', isAuthenticated, async (req, res) => {
  try {
    const { action } = req.body;
    const user = req.session.user;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).render('404', { title: 'Order Not Found' });
    }

    const isClientUser = order.clientId.toString() === user._id.toString();
    const isFreelancerUser = order.freelancerId.toString() === user._id.toString();

    if (!isClientUser && !isFreelancerUser) {
      return res.status(403).send('Access denied');
    }

    // Client: cancel pending
    if (action === 'cancel') {
      if (!isClientUser) return res.status(403).send('Clients only');
      if (order.status !== 'pending') return res.status(400).send('Only pending orders can be cancelled');

      order.status = 'cancelled';
      await order.save();
      return res.redirect('/orders/client');
    }

    // Freelancer: start pending
    if (action === 'start') {
      if (!isFreelancerUser) return res.status(403).send('Freelancers only');
      if (order.status !== 'pending') return res.status(400).send('Only pending orders can be started');

      order.status = 'in-progress';
      await order.save();
      return res.redirect('/orders/freelancer');
    }

    // Freelancer: complete in-progress
    if (action === 'complete') {
      if (!isFreelancerUser) return res.status(403).send('Freelancers only');
      if (order.status !== 'in-progress') return res.status(400).send('Only in-progress orders can be completed');

      order.status = 'completed';
      order.completedDate = new Date();
      await order.save();
      return res.redirect('/orders/freelancer');
    }

    return res.status(400).send('Invalid action');
  } catch (err) {
    console.error('Update order status error:', err);
    return res.status(500).render('500', { title: 'Server Error' });
  }
});

module.exports = router;
