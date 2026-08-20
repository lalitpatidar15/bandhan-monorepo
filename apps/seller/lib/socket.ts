let socket: any = null;

export async function getSocket() {
  if (socket) return socket;
  if (typeof window === "undefined") return null;

  try {
    const { io } = await import("socket.io-client");
    const url = (() => {
      if (typeof window !== "undefined") {
        return (
          process.env.NEXT_PUBLIC_SOCKET_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          window.location.origin
        );
      }
      return process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    })();

    const token =
      localStorage.getItem("sellerToken") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    socket = io(url.replace(/\/api$/, ""), {
      autoConnect: true,
      transports: ["websocket", "polling"],
      auth: token ? { token } : undefined,
    });

    return socket;
  } catch (error) {
    console.warn("Socket initialization failed:", error);
    return null;
  }
}

export function getSocketSync() {
  return socket;
}
