import admin from "firebase-admin";

export async function sendNotification(token, messages, title) {
    admin.initializeApp({
        credential: JSON.parse(process.env.SERVICE_ACCOUNT_PATH)
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
