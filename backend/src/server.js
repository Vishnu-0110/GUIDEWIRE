const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");
const { startSchedulers } = require("./jobs/scheduler");

async function bootstrap() {
  await connectDB();
  startSchedulers();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start backend", error);
  process.exit(1);
});
