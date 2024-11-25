const router = require('express').Router();
const Shift = require('../models/Shift');
const auth = require('../middleware/auth');

// Get shifts for a specific date
router.get('/:date', auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const shifts = await Shift.find({
      date: {
        $gte: new Date(date.setHours(0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59))
      }
    }).populate('bookedBy', 'name');
    
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Book a shift
router.post('/:shiftId/book', auth, async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.shiftId);
    
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    if (shift.bookedBy.length >= shift.totalSpots) {
      return res.status(400).json({ message: 'No spots available' });
    }

    if (shift.bookedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already booked this shift' });
    }

    shift.bookedBy.push(req.user.id);
    await shift.save();

    res.json(shift);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 