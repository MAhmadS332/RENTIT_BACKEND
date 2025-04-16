// models/Listing.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  avatar: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  listings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
});

module.exports = mongoose.model("User", userSchema);
