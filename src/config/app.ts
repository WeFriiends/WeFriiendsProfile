import express, { Express } from "express";
import { setupMiddleware } from "./middleware";
import v1Routes from "../routes/v1Router";

export const createApp = (): Express => {
  const app = express();

  setupMiddleware(app);

  // Add a route handler for the root path
  app.get("/", (req, res) => {
    res.send({
      message: "Welcome to WeFriiends API",
      documentation: "/api-docs",
      version: "1.0.0"
    });
  });

  app.use("/api", v1Routes);

  return app;
};
