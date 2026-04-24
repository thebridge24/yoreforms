const StackGateInactiveDate = require('../models/StackGateInactiveDate');
const StackGateAdmin = require('../models/StackGateAdmin');

const createOrUpdateInactiveDate = async (req, res) => {
  try {
    const { date, isFullDay, timeSlots, reason } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, error: 'Date is required' });
    }

    const dateString = date.includes('T') ? date.split('T')[0] : date;
    const targetDate = new Date(`${dateString}T00:00:00.000Z`);

    const existingRecord = await StackGateInactiveDate.findOne({ date: targetDate });

    if (existingRecord) {
      existingRecord.isFullDay = isFullDay;
      existingRecord.timeSlots = timeSlots || [];
      existingRecord.reason = reason || '';
      existingRecord.updatedAt = Date.now();
      await existingRecord.save();
      
      return res.json({
        success: true,
        message: 'StackGate inactive date updated successfully',
        data: existingRecord
      });
    }

    const inactiveDate = new StackGateInactiveDate({
      date: targetDate,
      isFullDay,
      timeSlots: timeSlots || [],
      reason: reason || '',
      createdBy: req.adminId
    });

    await inactiveDate.save();

    res.status(201).json({
      success: true,
      message: 'StackGate inactive date created successfully',
      data: inactiveDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getAllInactiveDates = async (req, res) => {
  try {
    const { startDate, endDate, date } = req.query;
    
    let query = {};
    
    if (date) {
      const dateString = date.includes('T') ? date.split('T')[0] : date;
      const targetDate = new Date(`${dateString}T00:00:00.000Z`);
      const inactiveDate = await StackGateInactiveDate.findOne({ date: targetDate });
      return res.json({
        success: true,
        data: inactiveDate
      });
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const inactiveDates = await StackGateInactiveDate.find(query)
      .sort({ date: 1 })
      .populate('createdBy', 'createdAt');

    res.json({
      success: true,
      count: inactiveDates.length,
      data: inactiveDates
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getInactiveDateByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    const dateString = date.includes('T') ? date.split('T')[0] : date;
    const targetDate = new Date(`${dateString}T00:00:00.000Z`);

    const inactiveDate = await StackGateInactiveDate.findOne({ date: targetDate });

    if (!inactiveDate) {
      return res.status(404).json({ 
        success: false, 
        error: 'No inactive settings found for this date' 
      });
    }

    res.json({
      success: true,
      data: inactiveDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const deleteInactiveDate = async (req, res) => {
  try {
    const { id } = req.params;

    const inactiveDate = await StackGateInactiveDate.findByIdAndDelete(id);

    if (!inactiveDate) {
      return res.status(404).json({ 
        success: false, 
        error: 'Inactive date not found' 
      });
    }

    res.json({
      success: true,
      message: 'StackGate inactive date deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const updateInactiveDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, isFullDay, timeSlots, reason } = req.body;

    const inactiveDate = await StackGateInactiveDate.findById(id);

    if (!inactiveDate) {
      return res.status(404).json({ 
        success: false, 
        error: 'Inactive date not found' 
      });
    }

    if (date) {
      const dateString = date.includes('T') ? date.split('T')[0] : date;
      inactiveDate.date = new Date(`${dateString}T00:00:00.000Z`);
    }
    
    if (isFullDay !== undefined) inactiveDate.isFullDay = isFullDay;
    if (timeSlots !== undefined) inactiveDate.timeSlots = timeSlots;
    if (reason !== undefined) inactiveDate.reason = reason;
    
    inactiveDate.updatedAt = Date.now();
    await inactiveDate.save();

    res.json({
      success: true,
      message: 'StackGate inactive date updated successfully',
      data: inactiveDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const checkDateAvailability = async (req, res) => {
  try {
    const { date, time } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, error: 'Date is required' });
    }

    const dateString = date.includes('T') ? date.split('T')[0] : date;
    const targetDate = new Date(`${dateString}T00:00:00.000Z`);

    const inactiveDate = await StackGateInactiveDate.findOne({ date: targetDate });

    if (!inactiveDate) {
      return res.json({
        success: true,
        available: true,
        message: 'Date is available'
      });
    }

    if (inactiveDate.isFullDay) {
      return res.json({
        success: true,
        available: false,
        message: 'Date is fully blocked',
        reason: inactiveDate.reason
      });
    }

    if (time && inactiveDate.timeSlots.length > 0) {
      const isTimeBlocked = inactiveDate.timeSlots.some(slot => {
        return time >= slot.start && time <= slot.end;
      });

      if (isTimeBlocked) {
        return res.json({
          success: true,
          available: false,
          message: 'Time slot is blocked',
          blockedTimeSlots: inactiveDate.timeSlots
        });
      }
    }

    res.json({
      success: true,
      available: true,
      message: 'Date and time are available',
      blockedTimeSlots: inactiveDate.timeSlots
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const bookSlotPublicPost = async (req, res) => {
  try {
    const { date, isFullDay, timeSlots, reason } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, error: 'Date is required' });
    }

    const dateString = date.includes('T') ? date.split('T')[0] : date;
    const targetDate = new Date(`${dateString}T00:00:00.000Z`);

    const existingRecord = await StackGateInactiveDate.findOne({ date: targetDate });

    if (existingRecord) {
      existingRecord.isFullDay = isFullDay;
      existingRecord.timeSlots = timeSlots || [];
      existingRecord.reason = reason || '';
      existingRecord.updatedAt = Date.now();
      await existingRecord.save();
      
      return res.json({
        success: true,
        data: existingRecord
      });
    }

    const admin = await StackGateAdmin.findOne();

    const inactiveDate = new StackGateInactiveDate({
      date: targetDate,
      isFullDay,
      timeSlots: timeSlots || [],
      reason: reason || '',
      createdBy: admin ? admin._id : undefined
    });

    await inactiveDate.save();

    res.status(201).json({
      success: true,
      data: inactiveDate
    });
  } catch (error) {
    console.error("Public Post Error:", error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const bookSlotPublicPut = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, isFullDay, timeSlots, reason } = req.body;

    const inactiveDate = await StackGateInactiveDate.findById(id);

    if (!inactiveDate) {
      return res.status(404).json({ 
        success: false, 
        error: 'Inactive date not found' 
      });
    }

    if (date) {
      const dateString = date.includes('T') ? date.split('T')[0] : date;
      inactiveDate.date = new Date(`${dateString}T00:00:00.000Z`);
    }
    
    if (isFullDay !== undefined) inactiveDate.isFullDay = isFullDay;
    if (timeSlots !== undefined) inactiveDate.timeSlots = timeSlots;
    if (reason !== undefined) inactiveDate.reason = reason;
    
    inactiveDate.updatedAt = Date.now();
    await inactiveDate.save();

    res.json({
      success: true,
      data: inactiveDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  createOrUpdateInactiveDate,
  getAllInactiveDates,
  getInactiveDateByDate,
  deleteInactiveDate,
  updateInactiveDate,
  checkDateAvailability,
  bookSlotPublicPost,
  bookSlotPublicPut
};