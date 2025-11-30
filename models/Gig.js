const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    trim: true
  },
  description: {
    type: String,
    required: true,
    minlength: 20
  },
  category: {
    type: String,
    required: true,
    enum: ['Web Development', 'Graphic Design', 'Writing & Translation', 'Digital Marketing', 'Video & Animation']
  },
  price: {
    type: Number,
    required: true,
    min: 5
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String
  }],
  deliveryTime: {
    type: Number,
    required: true,
    min: 1
  },
  tags: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gig', gigSchema);
