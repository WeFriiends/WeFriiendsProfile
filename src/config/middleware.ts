import express, { Express } from "express";
import cors from "cors";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./swagger";

export const setupMiddleware = (app: Express): void => {
  app.use(
    cors({
      origin: "http://localhost:3000", // Replace with your frontend's URL
    })
  );

  app.use(express.json());

  const swaggerDocs = swaggerJSDoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};