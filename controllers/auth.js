const path = require("path");
const debug = require("debug")(
  `dictionary-app:${path.basename(__dirname)}\\${path.basename(__filename)}`
);
const jwt = require("jsonwebtoken");

const User = require("../db/models/User");

// Authentication

/**
 * It takes in a username, email, and password from the request body, creates a new user object, saves
 * the user in the database, and then generates an access token for the user
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function in the application’s request-response cycle.
 */
async function registerUser(req, res, next) {
  const { username, email, password } = req.body;

  // Create a new user object
  const newUser = new User({
    username,
    email,
    password,
  });

  // Save User in the database
  try {
    const registeredUser = await newUser.save();
    // generate an access token
    if (registeredUser) {
      const payload = {
        id: registeredUser._id,
        username: registeredUser.username,
      };
      const accessToken = generateAccessToken(payload);
      res.status(201).json({ auth: true, accessToken });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ auth: false, message: "Internal Server Error" });
  }
}

/**
 * It takes in a user's email and password, checks if the user exists in the database, and if so,
 * checks if the password matches the one in the database. If it does, it generates a JWT and sends it
 * back to the user.
 * @param req - The request object.
 * @param res - the response object
 * @param next - A function to be called if the middleware function doesn't end the request-response
 * cycle.
 */
async function loginUser(req, res, next) {
  const { email, password } = req.body;

  // Authenticate User
  try {
    const registeredUser = await User.findOne({ email });
    if (registeredUser) {
      if (password === registeredUser.password) {
        const payload = {
          id: registeredUser._id,
          username: registeredUser.username,
        };
        const accessToken = generateAccessToken(payload);
        res.status(200).json({ auth: true, accessToken });
      } else {
        res.status(400).json({ auth: false, message: "incorrect password" });
      }
    } else {
      res.status(400).json({ auth: false, message: "incorrect email" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ auth: false, message: "Internal Server Error" });
  }
}

/**
 * It takes a payload and returns a signed JWT with a 60 second expiration
 * @param payload - The data you want to sign.
 * @returns A JWT token.
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: "5m",
  });
}

/**
 * If the token is valid, the function will add the username to the request object and call the next
 * function in the middleware chain.
 * @param req - the request object
 * @param res - the response object
 * @param next - The next middleware function in the stack.
 * @returns The token is being returned.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      debug(`[authenticateToken][failed]: ${err.message}`);
      return res.status(401).json({ message: "Not Authorized" });
    }
    debug(`[authenticateToken][success]: ${user.username}`);
    req.username = user.username;
    next();
  });
}

module.exports = {
  registerUser,
  loginUser,
  authenticateToken,
};
