const EventSource = require('eventsource');
const axios = require('axios');

/**
 * @typedef {Object} AssisfySDK
 * @property {string} apiKey - The API key
 * @property {Object} config - SDK configuration
 * @property {'production' | 'staging' | 'development'} environment - Current environment
 */

/**
 * @typedef {Object} Session
 * @property {string} sessionId - The session ID
 * @property {Function} emit - Event emitter function
 */

/** @type {string[]} */
const EVENT_TYPES = ['started', 'browser_started', 'action_run', 'thoughts_and_memories', 
                     'external_resource_requested', 'complete', 'error', 'hearbeat', 'connected'];

/**
 * Strategy for Server-Sent Events (SSE) connections
 */
class SSESessionStrategy {
    /** @type {string} */
    sessionId;
    /** @type {EventSource} */
    eventSource;
    /** @type {AssisfySDK} */
    sdk;
    /** @type {Session} */
    session;

    /**
     * Create a new SSE session strategy
     * @param {Session} session - The session instance
     * @param {AssisfySDK} sdk - The SDK instance
     */
    constructor(session, sdk) {
        this.eventSource = null;
        this.sessionId = session.sessionId;
        this.sdk = sdk;
        this.session = session;
        this.connectEventSource();
    }

    /**
     * Connect to the event source
     * @private
     */
    connectEventSource() {
        const { sseUrl } = this.sdk.config;
        const sessionId = this.sessionId;
        const apiKey = this.sdk.apiKey;
        const url = `${sseUrl}?sessionId=${sessionId}&apiKey=${apiKey}`;
        
        this.eventSource = new EventSource(url);

        // Handle connection events
        this.eventSource.onopen = () => {
            this.session.emit('session_connected', { sessionId });
        };

        this.eventSource.onerror = (error) => {
            this.session.emit('session_error', { sessionId, error: error.message });
        };

        // Register event listeners for all supported event types
        EVENT_TYPES.forEach(eventType => {
            this.eventSource.addEventListener(eventType, (event) => {
                try {
                    const eventData = JSON.parse(event.data);
                    this.session.emit("message", {
                        event: eventType,
                        data: eventData
                    });
                } catch (error) {
                    this.session.emit('session_error', { 
                        sessionId, 
                        error: `Error parsing event data: ${error.message}` 
                    });
                }
            });
        });
    }

    /**
     * Handle a permission request
     * @param {boolean} [granted=false] - Whether to grant the permission
     * @returns {Promise<void>}
     */
    async handlePermissionRequest(granted = false) {
        const { sseEgressUrl } = this.sdk.config;
        try {
            await axios.post(
                `${sseEgressUrl}?sessionId=${this.sessionId}&apiKey=${this.sdk.apiKey}`,
                {
                    event: 'external_resource_granted',
                    data: {
                        granted,
                        resource_type: 'admin_permission_request'
                    }
                }
            );
        } catch (error) {
            this.session.emit('session_error', { 
                sessionId: this.sessionId, 
                error: `Error granting permission: ${error.message}` 
            });
        }
    }

    /**
     * Handle user input
     * @param {string} [input=''] - The user input
     * @returns {Promise<void>}
     */
    async handleInput(input = '') {
        const { sseEgressUrl } = this.sdk.config;
        try {
            await axios.post(
                `${sseEgressUrl}?sessionId=${this.sessionId}&apiKey=${this.sdk.apiKey}`,
                {
                    event: 'external_resource_granted',
                    data: {
                        input,
                        resource_type: 'request_user_input',
                        granted: true
                    }
                }
            );
        } catch (error) {
            this.session.emit('session_error', { 
                sessionId: this.sessionId, 
                error: `Error handling input: ${error.message}` 
            });
        }
    }

    /**
     * Close the event source connection
     */
    close() {
        if (this.eventSource) {
            this.eventSource.close();
            this.session.emit('session_disconnected', {
                sessionId: this.sessionId,
                code: 1000,
                reason: 'Client closed connection'
            });
        }
    }
}

module.exports = SSESessionStrategy; 