const bcrypt = require("bcryptjs");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { encryptText, hashText } = require("../utils/crypto");
const { signToken } = require("../utils/jwt");
const { ApiError } = require("../utils/errors");

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    city: user.city,
    zone: user.zone,
    personaCategory: user.personaCategory,
    platform: user.platform,
    dailyIncome: user.dailyIncome,
    workingHours: user.workingHours,
    role: user.role
  };
}

function generateOtp() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone, city, zone, platform, dailyIncome, workingHours } =
    req.validated.body;

  if (email) {
    const existingByEmail = await User.findOne({ email });
    if (existingByEmail) throw new ApiError(409, "Email already registered");
  }
  if (phone) {
    const phoneHash = hashText(phone);
    const existingByPhone = await User.findOne({ phoneHash });
    if (existingByPhone) throw new ApiError(409, "Phone already registered");
  }

  const user = new User({
    name,
    email,
    city,
    zone: zone || "central",
    platform,
    dailyIncome,
    workingHours
  });

  if (password) {
    user.passwordHash = await bcrypt.hash(password, 10);
  }
  if (phone) {
    user.phoneEncrypted = encryptText(phone);
    user.phoneHash = hashText(phone);
    user.otpCode = generateOtp();
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  }

  await user.save();

  const token = signToken({ userId: user._id, role: user.role });
  res.status(201).json({
    message: "Signup successful",
    token,
    user: sanitizeUser(user),
    otpMock: user.otpCode || null
  });
});

const requestOtp = asyncHandler(async (req, res) => {
  const { phone } = req.validated.body;
  const phoneHash = hashText(phone);
  const user = await User.findOne({ phoneHash });
  if (!user) throw new ApiError(404, "User not found");

  user.otpCode = generateOtp();
  user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  res.json({ message: "OTP sent", otpMock: user.otpCode });
});

const login = asyncHandler(async (req, res) => {
  const { email, password, phone, otp } = req.validated.body;
  let user = null;

  if (email) {
    user = await User.findOne({ email });
    if (!user || !user.passwordHash) throw new ApiError(401, "Invalid credentials");
    const match = await bcrypt.compare(password || "", user.passwordHash);
    if (!match) throw new ApiError(401, "Invalid credentials");
  } else if (phone) {
    const phoneHash = hashText(phone);
    user = await User.findOne({ phoneHash });
    if (!user) throw new ApiError(401, "Invalid phone or OTP");
    const otpValid =
      user.otpCode === otp && user.otpExpiresAt && user.otpExpiresAt.getTime() > Date.now();
    if (!otpValid) throw new ApiError(401, "Invalid or expired OTP");
  }

  if (!user) throw new ApiError(401, "Invalid credentials");

  const token = signToken({ userId: user._id, role: user.role });
  res.json({ message: "Login successful", token, user: sanitizeUser(user) });
});

module.exports = { signup, login, requestOtp };
