type SellerSocket = {
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  off: (event: string, listener?: (...args: unknown[]) => void) => void;
  emit: (event: string, payload?: unknown) => void;
};

let socket: SellerSocket | null = null;
let socketDisabled = false;

const isVercelServerlessUrl = (url: string) => {
  try {
    return new URL(url).hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

export async function getSocket() {
  if (socket) return socket;
  if (socketDisabled) return null;
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
      return process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    })();

    // Socket.IO needs a persistent server, which Vercel serverless functions do
    // not provide. Do not repeatedly attempt a connection to the API deployment.
    if (isVercelServerlessUrl(url)) {
      socketDisabled = true;
      console.info("Real-time updates are unavailable on the Vercel API; using HTTP refresh.");
      return null;
    }

    const token =
      localStorage.getItem("sellerToken") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    socket = io(url.replace(/\/api$/, ""), {
      autoConnect: true,
      transports: ["websocket", "polling"],
      auth: token ? { token } : undefined,
    }) as SellerSocket;

    return socket;
  } catch (error) {
    console.warn("Socket initialization failed:", error);
    return null;
  }
}

export function getSocketSync() {
  return socket;
}
