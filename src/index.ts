import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import v1Routes from "./routes/v1Router";
import { swaggerOptions } from "./config/swagger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Allow requests from your frontend's origin
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend's URL
  })
);

// Middleware
app.use(express.json());
// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI! as string)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/api", v1Routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
