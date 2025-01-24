const axios = require('axios');
const WebSocketSessionStrategy = require('../strategies/WebSocketSessionStrategy');
const SSESessionStrategy = require('../strategies/SSESessionStrategy');
const EventEmitter = require('events');

/**
 * @typedef {Object} AutoTrigger
 * @property {number} interval - Interval in minutes between triggers
 * @property {string} end_at - ISO date string when auto-trigger should end
 * @property {boolean} [start_now] - Whether to start the first trigger immediately
 * @property {string} web_hook_url - URL to send webhook notifications to
 */

/**
 * @typedef {Object} SessionInput
 * @property {string} goal - The goal or task for the session
 * @property {string} [url] - Optional URL to start browsing from
 * @property {AutoTrigger} [withAutoTrigger] - Optional auto-trigger configuration
 * @property {'sse' | 'websocket'} [connectStrategy='sse'] - Connection strategy to use
 */

/**
 * @typedef {Object} AssisfySDK
 * @property {string} apiKey - The API key
 * @property {Object} config - SDK configuration
 * @property {'production' | 'staging' | 'development'} environment - Current environment
 */

/**
 * Session class for managing agent sessions
 * @extends EventEmitter
 */
class Session extends EventEmitter {
    /** @type {string} */
    sessionId;
    /** @type {Function} */
    handlePermissionRequest;
    /** @type {Function} */
    handleInput;
    /** @type {Function} */
    end;
    /** @type {WebSocketSessionStrategy | SSESessionStrategy} */
    strategy;
    /** @type {AssisfySDK} */
    sdk;

    /**
     * Create a new Session instance
     * @param {AssisfySDK} sdk - The SDK instance
     */
    constructor(sdk) {
        super();
        this.setMaxListeners(100);
        this.sdk = sdk;
    }

    /**
     * Create a new session
     * @param {SessionInput} input - The input configuration for the session
     * @returns {Promise<Session>} The session instance
     */
    async create(input) {
        const { withAutoTrigger = null, connectStrategy = 'sse' } = input;
        try {
            if (withAutoTrigger) {
                if (typeof withAutoTrigger !== 'object') {
                    throw new Error('Auto trigger must be an object');
                } else {
                    if (!withAutoTrigger.interval || !withAutoTrigger.end_at || !withAutoTrigger.web_hook_url) {
                        throw new Error('Auto trigger must have a interval, end_at and web_hook_url');
                    }
                }
            }

            const url = `${this.sdk.config.baseUrl}/sessions`;
            const { data: { data } } = await axios.post(url, {
                ...input,
                auto_trigger: withAutoTrigger
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.sdk.apiKey,
                },
            });

            console.log('data', data);

            // handle auto trigger
            if (withAutoTrigger && !withAutoTrigger?.start_now) {
                this.emit('session_created', data);
                return this;
            }

            this.sessionId = data.sessionId;
            this.emit('session_created', { sessionId: this.sessionId });

            // Initialize the appropriate strategy
            this.strategy = connectStrategy === 'websocket' 
                ? new WebSocketSessionStrategy(this, this.sdk)
                : new SSESessionStrategy(this, this.sdk);

            this.handlePermissionRequest = this.strategy.handlePermissionRequest.bind(this.strategy);
            this.handleInput = this.strategy.handleInput.bind(this.strategy);
            this.end = (message) => {
                console.log(`ending session: ${this.sessionId} `, message);
                this.strategy.close(1000, message || 'Ending session from client');
            };

            this.on('message', (message) => {
                if (message.event === 'complete') {
                    this.end("Reason='Session completed'");
                }
            });
            return this;
        } catch (error) {
            const { response } = error;
            const { request, ...errorObject } = response || {};
            throw new Error(
                errorObject.data?.error ||
                errorObject.data?.message ||
                errorObject.data?.error_message ||
                errorObject.data?.error_description ||
                errorObject.data ||
                error.message
            );
        }
    }

    /**
     * Get data about the current session
     * @returns {Promise<Object>} The session data
     */
    async getSessionData() {
        const { data } = await axios.get(`${this.sdk.config.baseUrl}/sessions/${this.sessionId}`, {
            headers: {
                'x-api-key': this.sdk.apiKey,
            },
        });
        return data;
    }

    /**
     * Connect to an existing session
     * @param {string} sessionId - The ID of the session to connect to
     * @param {'sse' | 'websocket'} [connectStrategy='sse'] - Connection strategy to use
     * @returns {Promise<Session>} The session instance
     */
    async connect(sessionId, connectStrategy = 'sse') {
        if (!sessionId) {
            throw new Error('Session ID is required');
        }
        try {
            this.sessionId = sessionId;

            // Initialize the appropriate strategy
            this.strategy = connectStrategy === 'websocket' 
                ? new WebSocketSessionStrategy(this, this.sdk)
                : new SSESessionStrategy(this, this.sdk);

            this.handlePermissionRequest = this.strategy.handlePermissionRequest.bind(this.strategy);
            this.handleInput = this.strategy.handleInput.bind(this.strategy);
            this.end = (message) => {
                console.log(`ending session: ${this.sessionId} `, message);
                this.strategy.close(1000, message || 'Ending session from client');
            };

            this.on('message', (message) => {
                if (message.event === 'complete') {
                    this.end("Reason='Session completed'");
                }
            });
            return this;
        } catch (error) {
            const { response } = error;
            const { request, ...errorObject } = response || {};
            throw new Error(
                errorObject?.data?.error ||
                errorObject?.data?.message ||
                errorObject?.data?.error_message ||
                errorObject?.data?.error_description ||
                errorObject?.data ||
                error.message
            );
        }
    }
}

module.exports = Session;