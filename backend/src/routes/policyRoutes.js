const express = require("express");
const { authRequired } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { buyPolicySchema } = require("../types/schemas");
const {
  getPlanSuggestions,
  buyPolicy,
  getMyPolicies
} = require("../controllers/policyController");

const router = express.Router();

router.use(authRequired);
router.get("/suggestions", getPlanSuggestions);
router.post("/buy", validate(buyPolicySchema), buyPolicy);
router.get("/my", getMyPolicies);

module.exports = router;
