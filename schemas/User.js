const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    minLength: [5, "Username should be longer than 5 characters"],
    maxLength: [50, "Username should be shorter than 50 characters"],
    required: true,
    message: "Username should be between length 5-50",
  },
  email: {
    type: String,
    minLength: 6,
    maxLength: 50,
    required: true,
    unique: [true, "Email already used"], //  TODO: unique is not validator
  },
  hashedPassword: { type: String, minLength: 6, required: true },
  loginToken: { type: String, default: "" },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
