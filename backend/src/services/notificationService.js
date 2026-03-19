async function notifyUser(user, message) {
  // Placeholder for SMS/push providers.
  // eslint-disable-next-line no-console
  console.log(`Notification to ${user.name}: ${message}`);
  return { delivered: true };
}

async function sendOfflineSms(phoneMasked, message) {
  // Simulated SMS for low-connectivity regions.
  // eslint-disable-next-line no-console
  console.log(`Offline SMS to ${phoneMasked}: ${message}`);
  return { delivered: true, channel: "sms" };
}

module.exports = { notifyUser, sendOfflineSms };
