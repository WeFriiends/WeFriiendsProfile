import express, { Express } from "express";
import { setupMiddleware } from "./middleware";
import v1Routes from "../routes/v1Router";

export const createApp = (): Express => {
  const app = express();
  
  // Setup middleware
  setupMiddleware(app);
  
  // Setup routes
  app.use("/api", v1Routes);
  
  return app;
};