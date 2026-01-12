const express = require('express');
const router = express.Router();

const Order = require('../models/Order');
const Gig = require('../models/Gig');
const { isAuthenticated, isClient, isFreelancer } = require('../middleware/auth');

// POST /orders - Create a new order
router.post('/', isAuthenticated, isClient, async (req, res) => {
  try {
    const { gigId, requirements } = req.body;

    // 1. Fetch Gig first (Fail fast if it doesn't exist)
    const gig = await Gig.findById(gigId).lean();

    if (!gigId) {
      return res.status(400).render('400', {
        title: 'Bad Request - CareFreelancer',
        message: 'Missing gig ID. Please select a gig to order.'
      });
    }

    // 2. Consolidated Validation
    if (!gig || gig.status === 'deleted') {
      return res.status(404).render('404', {
        title: 'Not Found - CareFreelancer',
        message: 'This gig is no longer available.'
      });
    }
    if (!requirements || requirements.trim().length < 10) {
      return res.status(400).render('400', {
        title: 'Bad Request - CareFreelancer',
        message: 'Requirements must be at least 10 characters long. Please describe what you need from the freelancer.'
      });
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

    res.redirect('/orders/client');

  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).render('500', { title: 'Server Error' });
  }
});

// GET /orders/client - Client orders
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

// GET /orders/freelancer - Freelancer orders
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
      return res.status(403).render('403', {
        title: 'Access Denied - CareFreelancer',
        message: 'You can only view orders you are involved in.'
      });
    }

    return res.render('orders/detail', {
      title: 'Order Details - CareFreelancer',
      order
    });
  } catch (err) {
    console.error('Order details error:', err);
    return res.status(500).render('500', { title: 'Server Error' });
  }
});

// PATCH /orders/:id - Update order status
router.patch('/:id', isAuthenticated, async (req, res) => {
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
      return res.status(403).render('403', {
        title: 'Access Denied - CareFreelancer',
        message: 'You can only modify orders you are involved in.'
      });
    }

    // Client actions
    if (action === 'cancel') {
      if (!isClientUser) {
        return res.status(403).render('403', {
          title: 'Access Denied - CareFreelancer',
          message: 'Only the client can cancel this order.'
        });
      }
      if (order.status !== 'pending') {
        return res.status(400).render('400', {
          title: 'Bad Request - CareFreelancer',
          message: 'Only pending orders can be cancelled. This order is already ' + order.status + '.'
        });
      }

      order.status = 'cancelled';
      await order.save();
      return res.redirect('/orders/client');
    }

    // Freelancer actions
    if (action === 'start') {
      if (!isFreelancerUser) {
        return res.status(403).render('403', {
          title: 'Access Denied - CareFreelancer',
          message: 'Only the freelancer can start this order.'
        });
      }
      if (order.status !== 'pending') {
        return res.status(400).render('400', {
          title: 'Bad Request - CareFreelancer',
          message: 'Only pending orders can be started. This order is already ' + order.status + '.'
        });
      }

      order.status = 'in-progress';
      await order.save();
      return res.redirect('/orders/freelancer');
    }

    if (action === 'complete') {
      if (!isFreelancerUser) {
        return res.status(403).render('403', {
          title: 'Access Denied - CareFreelancer',
          message: 'Only the freelancer can complete this order.'
        });
      }
      if (order.status !== 'in-progress') {
        return res.status(400).render('400', {
          title: 'Bad Request - CareFreelancer',
          message: 'Only in-progress orders can be completed. This order is currently ' + order.status + '.'
        });
      }

      order.status = 'completed';
      order.completedDate = new Date();
      await order.save();
      return res.redirect('/orders/freelancer');
    }

    return res.status(400).render('400', {
      title: 'Bad Request - CareFreelancer',
      message: 'Invalid action. Please use the provided buttons to update order status.'
    });
  } catch (err) {
    console.error('Update order status error:', err);
    return res.status(500).render('500', { title: 'Server Error' });
  }
});

module.exports = router;
