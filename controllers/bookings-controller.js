const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const User = require("../models/User");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const createBooking = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = {
      message: "Invalid inputs passed, please check your data.",
      code: 422,
    };
    return next(error);
  }

  if (!req.userId) {
    const error = {
      message: "Login to create a booking.",
      code: 401,
    };
    return next(error);
  }

  const user = await User.findById(req.userId.id).populate("bookings");
  if (!user) {
    const error = {
      message: "Could not find a user for the provided id.",
      code: 404,
    };
    return next(error);
  }

  const { listingId, name, email, phone, checkIn, checkOut } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    const error = {
      message: "Could not find a listing for the provided id.",
      code: 404,
    };
    return next(error);
  }

  const booking = new Booking({
    listingId,
    name,
    email,
    phone,
    checkIn,
    checkOut,
    bookingUser: req.userId.id,
  });

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await booking.save({ session: session });
    user.bookings.push(booking);
    await user.save({ session: session });
    await session.commitTransaction();
    session.endSession();
    res.json(booking.toObject({ getters: true })).status(201);
  } catch (err) {
    const error = {
      message: "Error creating booking.",
      code: 500,
    };
    return next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings.map((booking) => booking.toObject({ getters: true })));
  } catch (err) {
    const error = {
      message: "Error accessing bookings.",
      code: 404,
    };
    return next(error);
  }
};

const getBookingsByUserId = async (req, res, next) => {
  const userId = req.params.id;
  if (userId !== req.userId.id) {
    const error = {
      message: "Unauthorized.",
      code: 401,
    };
    return next(error);
  }

  try {
    const user = await User.findById(userId).populate("bookings");
    if (!user) {
      const error = {
        message: "Could not find a user for the provided id.",
        code: 404,
      };
      return next(error);
    }
    res.json(
      user.bookings.map((booking) => booking.toObject({ getters: true }))
    );
  } catch (err) {
    const error = {
      message: "Error accessing bookings.",
      code: 404,
    };
    return next(error);
  }
};

const removeBooking = async (req, res, next) => {
  const id = req.params.id;

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      const error = {
        message: "Could not find a booking for the provided id.",
        code: 404,
      };
      return next(error);
    }

    const user = await User.findById(req.userId.id).populate("bookings");
    if (!user) {
      const error = {
        message: "Could not find a user for the provided id.",
        code: 404,
      };
      return next(error);
    }

    if (booking.bookingUser.toString() !== req.userId.id) {
      const error = {
        message: "Unauthorized.",
        code: 401,
      };
      return next(error);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    await user.bookings.pull(booking);
    await user.save({ session: session });
    await booking.remove({ session: session });
    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    const error = {
      message: "Error removing booking.",
      code: 500,
    };
    return next(error);
  }
  res.json({ message: "Booking removed." }).status(200);
};

const removeBookingByAdmin = async (req, res, next) => {
  const id = req.params.id;

  if (!req.userId) {
    const error = {
      message: "Login to remove a booking.",
      code: 401,
    };
    return next(error);
  }

  const admin = await User.findById(req.userId.id);
  if (!admin) {
    const error = {
      message: "Could not find a user for the provided id.",
      code: 404,
    };
    return next(error);
  }

  if (req.userId.id !== process.env.ADMIN_ID) {
    const error = {
      message: "Unauthorized.",
      code: 401,
    };
    return next(error);
  }

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      const error = {
        message: "Could not find a booking for the provided id.",
        code: 404,
      };
      return next(error);
    }

    const user = await User.findById(booking.bookingUser).populate("bookings");
    if (!user) {
      const error = {
        message: "Could not find a user for the provided id.",
        code: 404,
      };
      return next(error);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    await user.bookings.pull(booking);
    await user.save({ session: session });
    await booking.deleteOne({_id: id},{ session: session });
    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Booking removed." }).status(200);
  } catch (err) {
    console.log(err)
    const error = {
      message: "Error removing booking.",
      code: 500,
    };
    return next(error);
  }
};

module.exports = {
  createBooking,
  getBookingsByUserId,
  removeBooking,
  getAllBookings,
  removeBookingByAdmin,
};
