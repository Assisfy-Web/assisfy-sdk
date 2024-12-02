const productionConfig = {
    baseUrl: "https://api.assisfy.com/api/v1",
    socketUrl: "wss://api.assisfy.com/v1/connect"
}

const developmentConfig = {
    baseUrl: "https://api-dev.assisfy.com/api/v1",
    socketUrl: "wss://api-dev.assisfy.com/v1/connect"
}

module.exports = { productionConfig, developmentConfig };