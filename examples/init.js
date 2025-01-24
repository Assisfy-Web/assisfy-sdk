require('dotenv').config();
const sdk = require('../');

// http://<server-ip>:31190/api/v1
const assisfy = new sdk({
    apiKey: process.env.ASSISFY_API_KEY,
    environment: "development",
    config: {
        baseUrl: 'http://143.198.96.25:31190/api/v1',
        wsUrl: 'ws://143.198.96.25:31190/v1/connect',
    },
});

module.exports = assisfy;