const express = require("express");
const validate = require("../middleware/validate");
const { signupSchema, loginSchema, otpRequestSchema } = require("../types/schemas");
const { signup, login, requestOtp } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/request-otp", validate(otpRequestSchema), requestOtp);

module.exports = router;
