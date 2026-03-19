const express = require("express");
const { authRequired } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { profileSchema, workStatusSchema } = require("../types/schemas");
const { getMe, updateProfile, setWorkStatus } = require("../controllers/userController");

const router = express.Router();

router.use(authRequired);
router.get("/me", getMe);
router.put("/me", validate(profileSchema), updateProfile);
router.post("/work-status", validate(workStatusSchema), setWorkStatus);

module.exports = router;
