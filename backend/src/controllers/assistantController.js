const asyncHandler = require("../utils/asyncHandler");
const { getVoiceMessage } = require("../services/assistantService");
const { sendOfflineSms } = require("../services/notificationService");

const voiceAssist = asyncHandler(async (req, res) => {
  const { lang = "en", intent = "upgrade" } = req.query;
  const message = getVoiceMessage({ lang, intent });
  res.json({ lang, intent, message });
});

const offlineAlert = asyncHandler(async (req, res) => {
  const { phone = "xxxxxx1234", message = "Risk alert from GigShield AI." } = req.body;
  const result = await sendOfflineSms(phone, message);
  res.json({ status: "sent", result });
});

module.exports = { voiceAssist, offlineAlert };
