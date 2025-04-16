const jwt = require("jsonwebtoken");

const jwtKey = process.env.JWT_KEY;

const checkAuth = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  //Authorization: 'Bearer TOKEN'
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      const error = {
        message: "Authentication Failed",
        code: 401,
      };
      return next(error);
    }

    //throw error if verification failed
    const decodedTkn = jwt.verify(token, jwtKey);

    req.userId = { id: decodedTkn.userId };
    next();
  } catch (err) {
    const error = {
      message: "Authentication Failed",
      code: 401,
    };
    return next(error);
  }
};

module.exports = checkAuth;
