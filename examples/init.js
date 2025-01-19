require('dotenv').config();
const sdk = require('../');

const assisfy = new sdk({
    apiKey: process.env.ASSISFY_API_KEY,
    environment: "production",
});

module.exports = assisfy;