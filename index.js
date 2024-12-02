const { productionConfig, developmentConfig } = require('./config');
const Session = require('./modules/session');

class AssisfySDK {
    apiKey;
    config;
    environment;

    constructor({ apiKey, config = {}, environment }) {
        this.apiKey = apiKey;
        this.environment = environment;
        this.config = {
            ...(environment === "development" ? developmentConfig : productionConfig),
            ...config
        };
    }

    session() {
        return new Session(this);
    }
}

module.exports = AssisfySDK;