const { processTransaction } = require("./transactionService");

exports.handleWebhookEvent = (event) => {
  console.log("Handling webhook event:", event);
  processTransaction(event.transaction);
};
