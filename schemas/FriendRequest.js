const mongoose = require("mongoose");
const { Schema } = mongoose;

const friendRequestSchema = new Schema({
	sender: { type: mongoose.ObjectId, required: true, ref: "User" },
	receiver: { type: mongoose.ObjectId, required: true, ref: "User" },
});

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
module.exports = FriendRequest;
