const productionConfig = {
    baseUrl: 'https://assisfy-genesis.cv/api/v1',
    wsUrl: 'wss://assisfy-genesis.cv/v1/connect',
    sseUrl: 'https://assisfy-genesis.cv/events/v1/connect',
    sseEgressUrl: 'https://assisfy-genesis.cv/events/v1/egress'
};

const stagingConfig = {
    baseUrl: 'https://developer.assisfy-genesis.cv/api/v1',
    wsUrl: 'wss://developer.assisfy-genesis.cv/v1/connect',
    sseUrl: 'https://developer.assisfy-genesis.cv/events/v1/connect',
    sseEgressUrl: 'https://developer.assisfy-genesis.cv/events/v1/egress'
};

const developmentConfig = {
    baseUrl: 'http://localhost:31190/api/v1',
    wsUrl: 'ws://localhost:31190/v1/connect',
    sseUrl: 'http://localhost:31190/events/v1/connect',
    sseEgressUrl: 'http://localhost:31190/events/v1/egress'
};

module.exports = {
    productionConfig,
    stagingConfig,
    developmentConfig
};