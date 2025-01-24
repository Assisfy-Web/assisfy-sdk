require('dotenv').config();
const sdk = require('../');

const assisfy = new sdk({
    apiKey: process.env.ASSISFY_API_KEY,
    environment: "staging",
    // You can still override specific config values if needed
    // config: {
    //     baseUrl: 'https://custom-domain.com/api/v1',
    //     wsUrl: 'wss://custom-domain.com/v1/connect',
    //     sseUrl: 'https://custom-domain.com/events/v1/connect',
    //     sseEgressUrl: 'https://custom-domain.com/events/v1/egress'
    // }
});

module.exports = assisfy; 