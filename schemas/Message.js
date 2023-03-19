const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
	textBody: { type: String, required: true },
	sender: { type: String, required: true },
	receiver: { type: String, required: true },
	timestamp: { type: Date, required: true }
})

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;