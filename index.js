const { productionConfig, developmentConfig, stagingConfig } = require('./config');
const Session = require('./modules/session');

/**
 * @typedef {Object} SDKConfig
 * @property {string} baseUrl - Base URL for API requests
 * @property {string} wsUrl - WebSocket URL for real-time connections
 * @property {string} sseUrl - Server-Sent Events URL for real-time connections
 * @property {string} sseEgressUrl - Server-Sent Events egress URL for sending events
 */

/**
 * @typedef {Object} SDKOptions
 * @property {string} apiKey - The API key for authentication
 * @property {SDKConfig} [config] - Optional configuration overrides
 * @property {'production' | 'staging' | 'development'} [environment='production'] - The environment to use
 */

/**
 * AssisfySDK main class for interacting with the Assisfy API
 */
class AssisfySDK {
    /** @type {string} */
    apiKey;
    /** @type {SDKConfig} */
    config;
    /** @type {'production' | 'staging' | 'development'} */
    environment;

    /**
     * Create a new instance of AssisfySDK
     * @param {SDKOptions} options - The options for configuring the SDK
     */
    constructor({ apiKey, config = {}, environment = 'production' }) {
        this.apiKey = apiKey;
        this.environment = environment;
        this.config = {
            ...(environment === 'development' ? developmentConfig : 
               environment === 'staging' ? stagingConfig : 
               productionConfig),
            ...config
        };
    }

    /**
     * Create a new session instance
     * @returns {Session} A new session instance
     */
    session() {
        return new Session(this);
    }
}

module.exports = AssisfySDK;