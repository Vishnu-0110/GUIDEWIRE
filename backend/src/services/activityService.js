const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

async function updateWorkStatus(userId, payload) {
  const user = await User.findById(userId);
  if (!user) return null;

  user.isOnline = payload.online;
  user.onlineSince = payload.online ? user.onlineSince || new Date() : null;
  user.lastActivityAt = new Date();
  user.lastKnownLocation = {
    lat: payload.lat,
    lng: payload.lng,
    city: payload.city || user.city,
    zone: payload.zone || user.zone
  };
  if (payload.city) user.city = payload.city;
  if (payload.zone) user.zone = payload.zone;
  await user.save();

  await ActivityLog.create({
    userId: user._id,
    city: user.city,
    zone: user.zone,
    lat: payload.lat,
    lng: payload.lng,
    deliveriesCompleted: payload.deliveriesCompleted || 0,
    online: payload.online,
    timestamp: new Date()
  });

  return user;
}

module.exports = { updateWorkStatus };
