const { Queue, Worker } = require("bullmq");
const IORedis = require("ioredis");
const env = require("../config/env");

let payoutQueue = null;
let payoutWorker = null;
let fallbackProcessor = null;

function hasRedis() {
  return Boolean(env.redisUrl);
}

function initQueue(processor) {
  fallbackProcessor = processor;
  if (!hasRedis()) {
    // eslint-disable-next-line no-console
    console.log("QueueService: REDIS_URL missing, using in-process fallback queue.");
    return;
  }

  const connection = new IORedis(env.redisUrl, {
    maxRetriesPerRequest: null
  });

  payoutQueue = new Queue("payout-jobs", { connection });
  payoutWorker = new Worker("payout-jobs", processor, { connection });

  payoutWorker.on("failed", (job, error) => {
    // eslint-disable-next-line no-console
    console.error("Queue job failed", job?.id, error.message);
  });
}

async function enqueuePayoutJob(payload) {
  if (payoutQueue) {
    await payoutQueue.add("process-payout", payload, {
      removeOnComplete: 100,
      removeOnFail: 100
    });
    return;
  }

  if (fallbackProcessor) {
    await fallbackProcessor({ data: payload });
  }
}

module.exports = { initQueue, enqueuePayoutJob };
