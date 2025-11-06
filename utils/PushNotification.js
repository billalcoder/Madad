import fetch from "node-fetch";

const ONESIGNAL_APP_ID = "19446a03-690a-4ff1-a3b4-9aeb313da54e";
const REST_API_KEY = "os_v2_app_dfcgua3jbjh7di5utlvtcpnfjzbwjkycpf4ed3ekympkzxpdqaylcbbx5jov2uy7hrcw5jkba4aynbkff2q7leejl5obgob6sexhcty"; // found in OneSignal dashboard

export async function sendNotification(playerId, message) {
  const response = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Basic ${REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: ["84d77227-c5c6-479a-bba9-94175f93462b"],
      contents: { en: "message" },
      headings: { en: "New Notification" },
    }),
  });

  const data = await response.json();
  console.log("Notification Response:", data);
}

sendNotification()