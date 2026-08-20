require("dns").setDefaultResultOrder("ipv4first");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const app = require("./app");
const validateEnv = require("./utils/validateEnv");
const { isOriginAllowed } = require("./utils/corsOrigins");

const PORT = Number(process.env.PORT) || 5000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin(origin, callback) {
            // Allow non-browser requests such as Postman and server-to-server calls.
            if (isOriginAllowed(origin)) return callback(null, true);

            console.error(`Socket.IO CORS rejected origin: ${origin}`);
            return callback(new Error("Origin is not allowed by Socket.IO CORS"));
        },
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
        credentials: true,
    },
});

global.io = io;

require("./socket/socket")(io);

server.keepAliveTimeout = 120000;
server.headersTimeout = 125000;

async function startServer() {
    try {
        console.log("Starting Bandhan backend...");
        console.log(`Node version: ${process.version}`);
        console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`Render port: ${PORT}`);

        console.log("Validating environment variables...");
        validateEnv();
        console.log("Environment validation completed");

        console.log("Connecting to MongoDB...");
        await connectDB();
        console.log("Connected to MongoDB");

        server.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on 0.0.0.0:${PORT}`);
        });
    } catch (error) {
        console.error("====================================");
        console.error("SERVER STARTUP FAILED");
        console.error("====================================");
        console.error("Message:", error?.message);
        console.error("Name:", error?.name);
        console.error("Code:", error?.code);
        console.error("Stack:", error?.stack || error);
        console.error("====================================");

        process.exit(1);
    }
}

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
});

process.on("SIGTERM", () => {
    console.log("SIGTERM received. Closing server...");

    server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
    });
});

process.on("SIGINT", () => {
    console.log("SIGINT received. Closing server...");

    server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
    });
});

startServer();
