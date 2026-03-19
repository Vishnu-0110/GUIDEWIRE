const asyncHandler = require("../utils/asyncHandler");
const { runGlobalTriggerCycle, runAreaTrigger } = require("../services/triggerService");

const triggerNow = asyncHandler(async (req, res) => {
  const result = await runGlobalTriggerCycle();
  res.json({ triggeredAt: new Date(), result });
});

const triggerAreaNow = asyncHandler(async (req, res) => {
  const { city, zone = "central" } = req.body;
  const result = await runAreaTrigger(city, zone);
  res.json({ triggeredAt: new Date(), result });
});

module.exports = { triggerNow, triggerAreaNow };
