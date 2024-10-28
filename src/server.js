import express from "express";
import dotenv from "dotenv";
import { webhookHandler } from "./handlers/webhookHandler.js";
import { logger } from "./utils/logger.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5430;

// Basic environment variable check
if (!process.env.HELIUS_AUTH_HEADER) {
    logger.warn("HELIUS_AUTH_HEADER is not set in .env file");
}

// Middleware
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Routes
app.post("/webhook-handler", webhookHandler);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Start server
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    logger.info(`Webhook endpoint: ${process.env.WEBHOOK_URL}`);
});

// Error handling
process.on("unhandledRejection", (error) => {
    logger.error("Unhandled rejection:", error);
});

process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception:", error);
});
