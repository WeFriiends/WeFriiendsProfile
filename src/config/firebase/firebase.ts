import admin from "firebase-admin";

try {
  const serviceAccount = require("./firebaseAdminsdk.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: 'your_database_url'
  });

  console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
}

const db = admin.firestore();

export default db;
