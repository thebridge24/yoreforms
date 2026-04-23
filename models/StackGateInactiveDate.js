const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  start: {
    type: String,
    required: true
  },
  end: {
    type: String,
    required: true
  }
});

const stackgateInactiveDateSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  isFullDay: {
    type: Boolean,
    default: false
  },
  timeSlots: [timeSlotSchema],
  reason: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StackGateAdmin',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

stackgateInactiveDateSchema.index({ date: 1 }, { unique: true });

stackgateInactiveDateSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.models.StackGateInactiveDate || mongoose.model('StackGateInactiveDate', stackgateInactiveDateSchema);