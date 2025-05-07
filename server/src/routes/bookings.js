const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Event = require('../models/Event');
const { auth, adminAuth } = require('../middleware/auth');

// Get all bookings (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { type, status, startDate, endDate, guestName } = req.query;
    const query = {};

    if (type) query.bookingType = type;
    if (status) query.status = status;
    if (guestName) {
      query.guestName = { $regex: guestName, $options: 'i' };
    }
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .populate('item')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ email: req.user.email })
      .populate('item')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create booking
router.post('/', async (req, res) => {
  try {
    const { bookingType, itemId, startDate, endDate } = req.body;

    // Check if item exists and is available
    const Item = bookingType === 'room' ? Room : Event;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: `${bookingType} not found` });
    }
    if (!item.isAvailable) {
      return res.status(400).json({ message: `${bookingType} is not available` });
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      item: itemId,
      bookingType,
      status: { $ne: 'cancelled' },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: 'Booking dates overlap with existing booking' });
    }

    const booking = new Booking(req.body);
    await booking.save();
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update booking status (admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel booking
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only allow cancellation if user is admin or booking belongs to user
    if (req.user.role !== 'admin' && booking.email !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 