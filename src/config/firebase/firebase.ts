import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import * as admin from "firebase-admin";
import { Database } from "firebase-admin/database";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Client-side Firebase config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_RTDB,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize client-side Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Initialize server-side Firebase Admin SDK
let adminDb: Database | undefined;
try {
  const serviceAccountPath = __dirname + "/firebaseAdminsdk.json";

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_RTDB,
    });

    adminDb = admin.database();
    console.log("Firebase Admin SDK initialized successfully");
  } else {
    console.error(`Service account file not found at ${serviceAccountPath}`);
  }
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error);
}

console.log("Firebase Realtime DB initialized successfully.");

export { auth, admin, adminDb };
export default database;
