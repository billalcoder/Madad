import fetch from "node-fetch";
import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json" with { type: "json" };

export async function sendNotification(token, messages, title) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });

    const message = {
        notification: {
            title,
            body: messages,
        },
        token,
    };

    admin
        .messaging()
        .send(message)
        .then((response) => {
            console.log("Successfully sent message:", response);
        })
        .catch((error) => {
            console.error("Error sending message:", error);
        });
}
