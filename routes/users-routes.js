const router = require("express").Router();
const userController = require("../controllers/users-controller");
const { check } = require("express-validator");

router.post("/login", userController.loginUser);

router.post(
  "/register",
  [
    check("name").notEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
    check("role").notEmpty(),
    check("avatar").notEmpty(),
  ],
  userController.registerUser
);

module.exports.usersRouter = router;
