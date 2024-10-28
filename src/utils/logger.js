const logger = {
  info: (message, data) => {
    console.log("INFO:", message, data || "");
  },
  error: (message, error) => {
    console.error("ERROR:", message, error || "");
  },
};

// Export the logger object using ES module syntax
export { logger };