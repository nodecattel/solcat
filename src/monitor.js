require("dotenv").config();
const { createHeliusWebhook } = require("./services/createWebhookService");
const { logger } = require("./utils/logger");

const wallets = process.env.WALLETS || "";
const webhookUrl = process.env.WEBHOOK_URL || "";

const targetWallets = wallets.split(",").map((wallet) => wallet.trim().split(" ")[1]);

const setupMonitor = async () => {
  try {
    const webhookResponse = await createHeliusWebhook({
      webhookURL: webhookUrl,
      transactionTypes: ["TRANSFER", "BUY", "SELL"],
      accountAddresses: targetWallets,
      webhookType: "enhanced",
      authHeader: process.env.HELIOUS_AUTH_HEADER,
    });
    logger.info("Webhook successfully created:", webhookResponse);
  } catch (error) {
    logger.error("Failed to set up webhook:", error);
  }
};

setupMonitor();
