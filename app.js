const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const path = require("path");
const fs = require("fs");

const { listingRouter } = require("./routes/listings-routes");
const { bookingRouter } = require("./routes/bookings-routes");
const { usersRouter } = require("./routes/users-routes");

const PORT = process.env.PORT 
const MONGODB_URI = process.env.MONGODB_URI

app.use(cors());

app.use(express.json());

app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads", "images"))
);

app.use("/api/listings", listingRouter);

app.use("/api/bookings", bookingRouter);

app.use("/api/auth", usersRouter);

app.use((err, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }

  if (err) {
    console.log(err.message);
  }
  res.status(500 || err.code).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log("Server is running on port 5000");
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.log("Connection to the database failed, Error Code:", err.code);
  });
