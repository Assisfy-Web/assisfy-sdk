const axios = require('axios');
const WebSocketSessionStrategy = require('../strategies/WebSocketSessionStrategy');
const EventEmitter = require('events');



class Session extends EventEmitter {
    sessionId;
    handlePermissionRequest;
    handleInput;
    end;

    constructor(sdk) {
        super();
        this.setMaxListeners(100);
        this.sdk = sdk;
    }

    /**
     * Create a session
     * @param {Object} input - The input object
     * @param {Object} withAutoTrigger - The auto trigger object
     * @returns {Promise<Session>} The session object
     * 
     * @example
     * const session = await sdk.session().create({
     *     input: 'Hello, how are you?',
     *     withAutoTrigger: {
     *         interval: 30, // every 30 minutes
     *         end_at: '2025-01-20T00:00:00Z', // end at 12:00 AM
     *         start_now: true, // if true, a session will start immediately
     *         web_hook_url: 'https://example.com/webhook',
     *     }
     * });
     */
    async create(input) {
        const { withAutoTrigger = null } = input;
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

            const { data: { data } } = await axios.post(`${this.sdk.config.baseUrl}/sessions`, {
                ...input,
                auto_trigger: withAutoTrigger
            }, {
                headers: {
                'Content-Type': 'application/json',
                    'x-api-key': this.sdk.apiKey,
                },
            });

            // handle auto trigger
            if (withAutoTrigger && !withAutoTrigger?.start_now) {
                this.emit('session_created', data);
                return this;
            }

            this.sessionId = data.sessionId;
            this.emit('session_created', { sessionId: this.sessionId });

            const socket = new WebSocketSessionStrategy(
                this,
                this.sdk
            );

            this.handlePermissionRequest = socket.handlePermissionRequest;
            this.handleInput = socket.handleInput;
            this.end = (message) => {
                console.log(`ending session: ${this.sessionId} `, message);
                socket.close(1000, message || 'Ending session from client');
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

    async getSessionData() {
        const { data } = await axios.get(`${this.sdk.config.baseUrl}/sessions/${this.sessionId}`, {
            headers: {
                'x-api-key': this.sdk.apiKey,
            },
        });
        return data;
    }

    /**
     * Connect to a session
     * @param {String} sessionId - The session ID
     * @returns {Promise<Session>} The session object
     * 
     * @example
     * const session = await sdk.session().connect('1234567890');
     */
    async connect(sessionId) {
        if (!sessionId) {
            throw new Error('Session ID is required');
        }
        try {
            this.sessionId = sessionId;
            const socket = new WebSocketSessionStrategy(
                this,
                this.sdk
            );

            this.handlePermissionRequest = socket.handlePermissionRequest;
            this.handleInput = socket.handleInput;
            this.end = (message) => {
                console.log(`ending session: ${this.sessionId} `, message);
                socket.close(1000, message || 'Ending session from client');
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