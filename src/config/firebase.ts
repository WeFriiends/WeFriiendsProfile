import * as admin from 'firebase-admin'
import serviceAccount from '../serviceAccount.json'

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: 'https://wefriiends-f8f52-default-rtdb.europe-west1.firebasedatabase.app'
    })
}

export const firebaseDb = admin.database()