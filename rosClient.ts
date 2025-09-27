// rosClient.ts
import { Client } from "@foxglove/ws-protocol";

export function connectToRos(ip: string, onMessage: (msg: any) => void) {
  const client = new Client({
    url: `ws://${ip}:8765`,
    protocols: ["foxglove.websocket.v1"],
  });

  client.on("message", onMessage);

  client.on("open", () => {
    console.log(`Connected! ${ip}`);
  });

  client.on("close", () => {
    console.log(`Disconnected! ${ip}`);
  });

  return client;
}
