// lib/socket.ts
import type { Socket } from "socket.io-client";

let socket: Socket | null = null;

export async function getSocket() {
  if (socket) return socket;

  if (typeof window === "undefined") return null;

  try {
    // Direct dynamic import so Next.js/Webpack bundles socket.io-client properly
    const { io } = await import("socket.io-client");

    const url =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000";

    const token = localStorage.getItem("auth_token");

    socket = io(url.replace(/\/api$/, ""), {
      autoConnect: true,
      transports: ["websocket", "polling"],
      auth: token ? { token } : undefined,
    });

    return socket;
  } catch (err) {
    console.warn("socket.io-client initialization failed, real-time features disabled", err);
    return null;
  }
}

export function getSocketSync() {
  return socket;
}

export default getSocket;
