const fetch = require("node-fetch");

exports.fetchTokenData = async (tokenAddress) => {
  try {
    const response = await fetch(`https://api.tokenapi.com/token/${tokenAddress}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching token data:", error);
    throw error;
  }
};
