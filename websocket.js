import { WebSocketServer } from "ws";
import { getStoriesInLastFiveMinutes } from "./database.js";

export function initializeWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws) => {
    console.log("New WebSocket connection");

    const recentCount = await getStoriesInLastFiveMinutes();
    ws.send(JSON.stringify({ type: "initial", count: recentCount }));

    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });
  });

  return wss;
}
