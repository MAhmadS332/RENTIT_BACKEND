const router = require("express").Router();
const listingController = require("../controllers/listings-controller");
const FileUpload = require("../middlewares/file-upload");
const { check } = require("express-validator");
const jwt = require("../middlewares/jwt");

router.get("/", listingController.getAllListings);

router.get("/search", listingController.searchListings);

router.get("/:id", listingController.getListingById);

router.use(jwt);
//only admin is allowed

router.get("/user/:id", listingController.getListingByUserId);
router.post(
  "/",
  FileUpload.single("img"),
  [
    check("title").notEmpty(),
    check("location").notEmpty(),
    check("type").notEmpty(),
    // check("info.guests").notEmpty(),
    // check("info.bedrooms").notEmpty(),
    // check("info.bathrooms").notEmpty(),
    check("pricePerNight").notEmpty(),
    check("rating").notEmpty(),
  ],
  listingController.createListing
);

router.delete("/admin/:id", listingController.removeListingByAdmin);
router.delete("/:id", listingController.removeListing);

module.exports.listingRouter = router;
