const mongoose = require("mongoose");
const { Schema } = mongoose;

const friendSchema = new Schema({
	user1: { type: mongoose.ObjectId, required: true, ref: 'User' },
	user2: { type: mongoose.ObjectId, required: true, ref: 'User' },
})

const FriendSchema = mongoose.model('Friend', friendSchema);
module.exports = FriendSchema;