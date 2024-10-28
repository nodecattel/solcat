import { Helius } from "helius-sdk";
import { logger } from "../utils/logger.js";

const helius = new Helius(process.env.HELIUS_API_KEY);

export const createWebhook = async (config) => {
    try {
        if (!process.env.HELIUS_API_KEY) {
            throw new Error("HELIUS_API_KEY is required in environment variables");
        }

        logger.info("Creating webhook with config:", {
            url: config.webhookURL,
            transactionTypes: config.transactionTypes,
            accountAddresses: config.accountAddresses
        });

        const webhook = await helius.createWebhook({
            webhookURL: config.webhookURL,
            transactionTypes: config.transactionTypes,
            accountAddresses: config.accountAddresses,
            webhookType: "enhanced",
            authHeader: config.authHeader,
            webhook: {
                includeMetadata: true,
                includeFailedTransactions: false // We probably don't need failed transactions
            }
        });

        logger.info("Webhook created successfully:", {
            webhookId: webhook.webhookID,
            transactionTypes: webhook.transactionTypes
        });
        
        return webhook;
    } catch (error) {
        logger.error("Error creating webhook:", error);
        throw error;
    }
};
