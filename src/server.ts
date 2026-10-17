import dotenv from "dotenv";
import { createApp } from "./config/app";
import { connectDatabase } from "./config/database";
import initCronJobs from "./config/cron";

dotenv.config();

const startServer = async (): Promise<void> => {
  const app = createApp();
  const PORT = process.env.PORT || 8080;

  await connectDatabase();
  initCronJobs();
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/api-docs`);
  });
};

export default startServer;