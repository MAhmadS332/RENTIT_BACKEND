const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
//const usersData = [];

const jwtKey = process.env.JWT_KEY;
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = {
        message: "User not found.",
        code: 404,
      };
      return next(error);
    }
    try {
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        const error = {
          message: "Password is incorrect.",
          code: 401,
        };
        return next(error);
      }
    } catch (err) {
      console.log(err);
      const error = {
        message: "Error logging in.",
        code: 500,
      };
      return next(error);
    }

    const token = jwt.sign({ userId: user.id }, jwtKey, { expiresIn: "1h" });
    res
      .json({
        user: {
          userId: user.id,
          avatar: user.avatar,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: token,
      })
      .status(200);
  } catch (err) {
    const error = {
      message: "Error logging in.",
      code: 500,
    };
    return next(error);
  }
};

const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = {
      message: "Invalid inputs passed, please check your data.",
      code: 422,
    };
    return next(error);
  }

  const { avatar, name, email, password, role } = req.body;

  if (!["1", "2", "3", "4", "5"].includes(avatar)) {
    const error = {
      message:
        "Invalid avatar value. It must be one of '1', '2', '3', '4', or '5'.",
      code: 422,
    };
    return next(error);
  }

  if (!["host", "guest"].includes(role)) {
    const error = {
      message: "Invalid role value. It must be either 'host' or 'guest'.",
      code: 422,
    };
    return next(error);
  }

  let user;
  try {
    user = await User.findOne({
      email,
    });
    if (user) {
      const error = {
        message: "User already exists.",
        code: 400,
      };
      return next(error);
    }
  } catch (err) {
    const error = {
      message: "Error creating user.",
      code: 500,
    };
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  user = new User({
    avatar,
    name,
    email,
    role,
    password: hashedPassword,
    bookings: [],
    listings: [],
  });

  try {
    await user.save();
  } catch (err) {
    const error = {
      message: "Error creating user.",
      code: 500,
    };
    return next(error);
  }

  try {
    const token = jwt.sign({ userId: user.id }, jwtKey, { expiresIn: "1h" });
    res
      .json({
        user: {
          userId: user.id,
          avatar: user.avatar,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: token,
      })
      .status(201);
  } catch (err) {
    const error = {
      message: "Error creating user.",
      code: 500,
    };
    return next(error);
  }
};

module.exports = {
  loginUser,
  registerUser,
};
