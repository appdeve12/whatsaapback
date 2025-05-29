const mongoose = require('mongoose');

const incomingMessageSchema = new mongoose.Schema({
  whatsappId: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  message: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IncomingMessage', incomingMessageSchema);
