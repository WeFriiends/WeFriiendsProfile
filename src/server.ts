import dotenv from "dotenv";
import { createApp } from "./config/app";
import { connectDatabase } from "./config/database";

dotenv.config();

const startServer = async (): Promise<void> => {
  const app = createApp();
  const PORT = process.env.PORT || 8080;
  
  await connectDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/api-docs`);
  });
};

export default startServer;