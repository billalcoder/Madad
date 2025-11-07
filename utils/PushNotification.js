import admin from "firebase-admin";

if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_PATH);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export async function sendNotification(token, messages, title) {

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
