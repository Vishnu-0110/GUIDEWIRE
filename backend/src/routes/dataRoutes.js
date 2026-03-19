const express = require("express");
const {
  getWeatherByCity,
  getAqiByCity,
  getTrafficByCity,
  getPlatformStatusByCity,
  getSocialStatusByCity
} = require("../controllers/dataController");

const router = express.Router();

router.get("/weather", getWeatherByCity);
router.get("/aqi", getAqiByCity);
router.get("/traffic", getTrafficByCity);
router.get("/platform-status", getPlatformStatusByCity);
router.get("/social-status", getSocialStatusByCity);

module.exports = router;
