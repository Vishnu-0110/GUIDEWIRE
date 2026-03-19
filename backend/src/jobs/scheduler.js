const cron = require("node-cron");
const { runGlobalTriggerCycle } = require("../services/triggerService");
const { expirePolicies } = require("../services/policyService");
const { initQueue } = require("../services/queueService");
const { processPayoutForUserEvent } = require("../services/payoutService");

async function payoutWorker(job) {
  const data = job.data || job;
  await processPayoutForUserEvent({
    userId: data.userId,
    eventId: data.eventId
  });
}

function startSchedulers() {
  initQueue(payoutWorker);

  cron.schedule("0 * * * *", async () => {
    try {
      const result = await runGlobalTriggerCycle();
      // eslint-disable-next-line no-console
      console.log("Hourly trigger cycle completed", result.length);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Hourly trigger cycle failed", error.message);
    }
  });

  cron.schedule("5 0 * * *", async () => {
    try {
      const expired = await expirePolicies();
      // eslint-disable-next-line no-console
      console.log("Daily policy expiry check completed", expired);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Policy expiry cron failed", error.message);
    }
  });
}

module.exports = { startSchedulers };
