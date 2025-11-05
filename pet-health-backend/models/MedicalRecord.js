const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: String,
  dosage: String,
  frequency: String,
  startDate: Date,
  endDate: Date,
  prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const vaccinationSchema = new mongoose.Schema({
  name: String,
  manufacturer: String,
  batchNumber: String,
  date: Date,
  nextDueDate: Date,
  administeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const checkupSchema = new mongoose.Schema({
  reason: String,
  findings: String,
  recommendations: String,
  followUpDate: Date
});

const surgerySchema = new mongoose.Schema({
  procedure: String,
  preOpNotes: String,
  postOpNotes: String,
  complications: String,
  recovery: String
});

const medicalRecordSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  recordType: {
    type: String,
    enum: ['vaccination', 'medication', 'checkup', 'surgery', 'lab_result', 'other'],
    required: true
  },
  // Type-specific fields
  vaccination: vaccinationSchema,
  medication: medicationSchema,
  checkup: checkupSchema,
  surgery: surgerySchema,
  // Common fields
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  veterinarian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String,
  // File attachments
  attachments: [{
    filename: String,
    fileUrl: String,
    fileType: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  // Cost tracking
  cost: {
    amount: Number,
    currency: { type: String, default: 'USD' },
    paid: { type: Boolean, default: false },
    paymentDate: Date
  },
  // Creator tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// Update timestamp and updatedBy on save
medicalRecordSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.isModified() && this._update && this._update.$set) {
    this.updatedBy = this._update.$set.updatedBy;
  }
  next();
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
module.exports = MedicalRecord;