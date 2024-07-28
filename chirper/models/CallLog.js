// Filename: models/CallLog.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CallLogSchema = new Schema({
  conferenceId: { 
    type: String, 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    required: true 
  },
  dtmfInput: { 
    type: Array, 
    default: [] 
  },
  responses: { 
    type: Array, 
    default: [] 
  }
}, { timestamps: true });

module.exports = mongoose.model('CallLog', CallLogSchema);