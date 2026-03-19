function calculateLostHours(severityPercent, eventType) {
  const baseHoursByEvent = {
    curfew: 6,
    platform_outage: 5,
    local_strike: 6,
    zone_closure: 6,
    traffic: 4,
    rain: 4,
    heat: 4,
    aqi: 4
  };
  const baseHours = baseHoursByEvent[eventType] || 4;
  return Math.max(1, Math.ceil(baseHours * severityPercent));
}

function calculatePayout({
  dailyIncome,
  workingHours,
  lostHours,
  coverage,
  demandDropPercent = 0
}) {
  const safeWorkingHours = Math.max(1, workingHours);
  const avgHourlyIncome = dailyIncome / safeWorkingHours;
  const demandMultiplier = 1 + Math.min(Math.max(demandDropPercent, 0), 50) / 100;
  const payoutRaw = avgHourlyIncome * lostHours * demandMultiplier;
  const payout = Math.min(coverage, Math.round(payoutRaw));

  return {
    avgHourlyIncome: Number(avgHourlyIncome.toFixed(2)),
    demandMultiplier: Number(demandMultiplier.toFixed(2)),
    payout
  };
}

module.exports = { calculateLostHours, calculatePayout };
