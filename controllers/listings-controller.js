const Listing = require("../models/Listing");
const User = require("../models/User");
const Booking = require("../models/Booking");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// const listingsData = [
//   {
//     id: 1,
//     img: "/imgs/card_imgs/1.webp",
//     title: "Mashobra",
//     location: "India",
//     type: "Entire Home",
//     info: { guests: 5, bedrooms: 3, bathrooms: 2 },
//     pricePerNight: "$190",
//     rating: "3",
//   },
//   {
//     id: 2,
//     img: "/imgs/card_imgs/2.webp",
//     title: "Santorini",
//     location: "Greece",
//     type: "Villa",
//     info: { guests: 4, bedrooms: 2, bathrooms: 2 },
//     pricePerNight: "$250",
//     rating: "4.5",
//   },
//   {
//     id: 3,
//     img: "/imgs/card_imgs/3.webp",
//     title: "Kyoto",
//     location: "Japan",
//     type: "Traditional House",
//     info: { guests: 3, bedrooms: 1, bathrooms: 1 },
//     pricePerNight: "$130",
//     rating: "4.7",
//   },
//   {
//     id: 4,
//     img: "/imgs/card_imgs/4.webp",
//     title: "Reykjavik",
//     location: "Iceland",
//     type: "Apartment",
//     info: { guests: 2, bedrooms: 1, bathrooms: 1 },
//     pricePerNight: "$170",
//     rating: "4.8",
//   },
//   {
//     id: 5,
//     img: "/imgs/card_imgs/5.webp",
//     title: "Cape Town",
//     location: "South Africa",
//     type: "Beach House",
//     info: { guests: 6, bedrooms: 4, bathrooms: 3 },
//     pricePerNight: "$300",
//     rating: "5",
//   },
//   {
//     id: 6,
//     img: "/imgs/card_imgs/6.webp",
//     title: "Bali",
//     location: "Indonesia",
//     type: "Treehouse",
//     info: { guests: 2, bedrooms: 1, bathrooms: 1 },
//     pricePerNight: "$80",
//     rating: "4.2",
//   },
//   {
//     id: 7,
//     img: "/imgs/card_imgs/7.webp",
//     title: "Paris",
//     location: "France",
//     type: "Studio",
//     info: { guests: 2, bedrooms: 1, bathrooms: 1 },
//     pricePerNight: "$150",
//     rating: "4.3",
//   },
//   {
//     id: 8,
//     img: "/imgs/card_imgs/8.webp",
//     title: "Cappadocia",
//     location: "Turkey",
//     type: "Cave House",
//     info: { guests: 4, bedrooms: 2, bathrooms: 2 },
//     pricePerNight: "$200",
//     rating: "4.6",
//   },
//   {
//     id: 9,
//     img: "/imgs/card_imgs/9.webp",
//     title: "Bora Bora",
//     location: "French Polynesia",
//     type: "Overwater Bungalow",
//     info: { guests: 2, bedrooms: 1, bathrooms: 1 },
//     pricePerNight: "$500",
//     rating: "5",
//   },
// ];

const getAllListings = async (req, res, next) => {
  try {
    const listingsData = await Listing.find({});
    res
      .json(
        listingsData.map((listing) => {
          const listingObject = listing.toObject({ getters: true });
          listingObject.img = listingObject.img.replace(/\\/g, "/");
          return listingObject;
        })
      )
      .status(200);
  } catch (err) {
    const error = {
      message: "Error accessing listings.",
      code: 404,
    };
    return next(error);
  }
};

const getListingById = async (req, res, next) => {
  const id = req.params.id;

  try {
    let listingData = await Listing.findOne({ _id: id });
    listingData = listingData.toObject({ getters: true });
    listingData.img = listingData.img.replace(/\\/g, "/");
    res.json(listingData).status(200);
  } catch (err) {
    const error = {
      message: "Could not find a listing for the provided id.",
      code: 404,
    };
    return next(error);
  }
};

const createListing = async (req, res, next) => {
  if (!req.userId) {
    const error = {
      message: "Login to create a listing.",
      code: 401,
    };
    return next(error);
  }
  const user = await User.findById(req.userId.id).populate("listings");
  if (!user) {
    const error = {
      message:
        "You are not authorized to create a listing, try logging in first.",
      code: 401,
    };
    return next(error);
  }
  if (user.role !== "host") {
    const error = {
      message:
        "You are not authorized to create a listing, you must be a host.",
      code: 401,
    };
    return next(error);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = {
      message: "Invalid inputs passed, please check your data.",
      code: 422,
    };
    return next(error);
  }
  if (!req.file) {
    const error = {
      message: "No image provided.",
      code: 422,
    };
    return next(error);
  }

  const { title, location, type, pricePerNight, rating } = req.body;
  let { info } = req.body;
  try {
    info = JSON.parse(info);
    console.log(info);
  } catch (err) {
    console.log(err);
    const error = {
      message: "Invalid info object.",
      code: 422,
    };
    return next(error);
  }
  const listing = await Listing.findOne({ title });
  if (listing) {
    const error = {
      message: "Listing with same name already exists.",
      code: 400,
    };
    return next(error);
  }

  let newListing = new Listing({
    img: req.file.path,
    title,
    location,
    type,
    info,
    pricePerNight,
    rating,
    creator: req.userId.id,
  });

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await newListing.save();
    user.listings.push(newListing);
    await user.save();
    await session.commitTransaction();
    session.endSession();

    newListing = newListing.toObject({ getters: true });
    newListing.img = newListing.img.replace(/\\/g, "/");
    res.json(newListing).status(201);
  } catch (err) {
    console.log(err);
    const error = {
      message: "Error creating listing.",
      code: 500,
    };
    return next(error);
  }
};

const removeListing = async (req, res, next) => {
  const id = req.params.id;

  if (!req.userId) {
    const error = {
      message: "Login to remove a listing.",
      code: 401,
    };
    return next(error);
  }
  const user = await User.findById(req.userId.id).populate("listings");
  if (!user) {
    const error = {
      message: "You are not authorized to remove a listing.",
      code: 401,
    };
    return next(error);
  }

  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      const error = {
        message: "Could not find a listing for the provided id.",
        code: 404,
      };
      return next(error);
    }
    if (listing.creator.toString() !== req.userId.id) {
      const error = {
        message: "You are not authorized to delete this listing.",
        code: 401,
      };
      return next(error);
    }

    const booking = await Booking.findOne({ listingId: id });
    if (booking) {
      const error = {
        message: "Cannot delete listing with active bookings.",
        code: 400,
      };
      return next(error);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    await user.listings.pull(listing);
    await user.save({ session: session });
    await Listing.deleteOne({ _id: id }, { session: session });
    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Deleted Successfully" }).status(200);
  } catch (err) {
    console.log(err);
    const error = {
      message: "Error deleting listing.",
      code: 500,
    };
    return next(error);
  }
};

const searchListings = async (req, res, next) => {
  const query = req.query.query;
  let listingsData;

  try {
    if (!query || query === "") {
      listingsData = await Listing.find({});
    } else {
      listingsData = await Listing.find({
        location: { $regex: query, $options: "i" },
      });
    }
    res
      .json(
        listingsData.map((listing) => {
          const listingObject = listing.toObject({ getters: true });
          listingObject.img = listingObject.img.replace(/\\/g, "/");
          return listingObject;
        })
      )
      .status(200);
  } catch (err) {
    const error = {
      message: "Error searching listings.",
      code: 404,
    };
    return next(error);
  }
};

const getListingByUserId = async (req, res, next) => {
  const id = req.params.id;
  if (id !== req.userId.id) {
    const error = {
      message: "Unauthorized.",
      code: 401,
    };
    return next(error);
  }

  try {
    const user = await User.findById(id).populate("listings");
    if (!user) {
      const error = {
        message: "No user found for the provided id.",
        code: 404,
      };
      return next(error);
    }
    let listingsData = user.listings;
    res
      .json(
        listingsData.map((listing) => {
          const listingObject = listing.toObject({ getters: true });
          listingObject.img = listingObject.img.replace(/\\/g, "/");
          return listingObject;
        })
      )
      .status(200);
  } catch (err) {
    const error = {
      message: "Error accessing listings.",
      code: 404,
    };
    return next(error);
  }
};

const removeListingByAdmin = async (req, res, next) => {
  const id = req.params.id;

  if (!req.userId) {
    const error = {
      message: "Login to remove a listing.",
      code: 401,
    };
    return next(error);
  }

  const admin = await User.findById(process.env.ADMIN_ID);
  if (!admin) {
    const error = {
      message: "Admin not found.",
      code: 404,
    };
    return next(error);
  }

  if (req.userId.id !== process.env.ADMIN_ID) {
    const error = {
      message: "You are not authorized to delete a listing.",
      code: 401,
    };
    return next(error);
  }

  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      const error = {
        message: "Could not find a listing for the provided id.",
        code: 404,
      };
      return next(error);
    }

    const user = await User.findById(listing.creator).populate("listings");
    if (!user) {
      const error = {
        message: "Could not find a user for the listing.",
        code: 404,
      };
      return next(error);
    }

    const booking = await Booking.findOne({ listingId: id });
    if (booking) {
      const error = {
        message: "Cannot delete listing with active bookings.",
        code: 400,
      };
      return next(error);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    await user.listings.pull(listing);
    await user.save({ session: session });
    await Listing.deleteOne({ _id: id }, { session: session });
    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Deleted Successfully" }).status(200);
  } catch (err) {
    console.log(err);
    const error = {
      message: "Error deleting listing.",
      code: 500,
    };
    return next(error);
  }
};

module.exports = {
  getAllListings,
  getListingById,
  getListingByUserId,
  searchListings,
  createListing,
  removeListing,
  removeListingByAdmin,
};
