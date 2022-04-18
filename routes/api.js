var express = require("express");
var router = express.Router();

const {
  registerUser,
  loginUser,
  authenticateToken,
} = require("../controllers/auth");

const { getDictionaryReference } = require("../controllers/dictionary");

router.route("/dictionary").get(authenticateToken, getDictionaryReference);

router.route("/auth/register").post(registerUser);
router.route("/auth/login").post(loginUser);
module.exports = router;
