const templates = {
  en: {
    upgrade: "High risk this week. Upgrade your plan for stronger protection.",
    payout: "Disruption detected. Your payout has been processed automatically."
  },
  hi: {
    upgrade: "Is hafte risk high hai. Behtar suraksha ke liye plan upgrade karein.",
    payout: "Disruption detect hua. Aapka payout automatic process ho gaya hai."
  },
  ta: {
    upgrade:
      "Indha vaaram adhiga risk ulladhu. Ungal kavachathai adhigarikka plan upgrade seyyunga.",
    payout: "Disruption kandupidikkappattadhu. Ungal payout thaanagave anuppappattadhu."
  }
};

function getVoiceMessage({ lang = "en", intent = "upgrade" }) {
  const languagePack = templates[lang] || templates.en;
  return languagePack[intent] || languagePack.upgrade;
}

module.exports = { getVoiceMessage };
