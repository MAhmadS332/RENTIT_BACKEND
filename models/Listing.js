// models/Listing.js
const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
  img: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  info: { guests: Number, bedrooms: Number, bathrooms: Number },
  pricePerNight: { type: String, required: true },
  rating: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Listing", ListingSchema);
