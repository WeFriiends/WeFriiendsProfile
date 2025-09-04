import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI! as string);
    console.log("Connected to MongoDB");

    // One-time index migration for chats: drop old unique array index and ensure new compound index
    try {
      const db = mongoose.connection.db;
      if (!db) throw new Error("Database connection not established");
      const chats = db.collection("chats");
      const profiles = db.collection("profiles");

      const profileIndexes = await profiles.indexes();
      const oldLocationIdx = profileIndexes.find(
        (i) => i.name === "location_2dsphere"
      );
      if (oldLocationIdx) {
        await profiles.dropIndex("location_2dsphere");
        console.log("Dropped old index location_2dsphere on profiles");
      }
      const indexes = await chats.indexes();
      const oldIdx = indexes.find((i) => i.name === "participants_1");
      if (oldIdx) {
        await chats.dropIndex("participants_1");
        console.log("Dropped old index participants_1 on chats");
      }

      await profiles.createIndex({ location: "2dsphere" });
      console.log("Ensured 2dsphere index on location for profiles");

      await chats.createIndex(
        { "participants.0": 1, "participants.1": 1 },
        { unique: true }
      );
      console.log(
        "Ensured unique index on participants.0 and participants.1 for chats"
      );
    } catch (indexErr) {
      console.warn("Index migration warning (chats):", indexErr);
    }
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  }
};
