const WebSocket = require('ws');
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

/**
 * Strategy for handling WebSocket connections
 */
class WebSocketSessionStrategy {
    /** @type {string} */
    sessionId;
    /** @type {WebSocket} */
    websocket;
    /** @type {AssisfySDK} */
    sdk;
    /** @type {Session} */
    session;

    /**
     * Create a new WebSocket strategy instance
     * @param {Session} session - The session instance
     * @param {AssisfySDK} sdk - The SDK instance
     */
    constructor(session, sdk) {
        this.websocket = null;
        this.sessionId = session.sessionId;
        this.sdk = sdk;
        this.session = session;
        this.connectWebSocket();
    }

    /**
     * Connect to the WebSocket server
     * @private
     */
    connectWebSocket() {
        const { wsUrl } = this.sdk.config;
        const sessionId = this.sessionId;
        const apiKey = this.sdk.apiKey;
        const url = `${wsUrl}?sessionId=${sessionId}&apiKey=${apiKey}`;
        this.websocket = new WebSocket(url);
        this.websocket.onopen = () => {
            this.session.emit('session_connected', { sessionId });
        };

        this.websocket.onmessage = (message) => {
            const eventData = JSON.parse(message.data);
            this.session.emit("message", eventData);
        };

        this.websocket.onerror = (error) => {
            this.session.emit('session_error', { sessionId, error: error.message });
        };

        this.websocket.onclose = (error) => {
            const { code, reason } = error;
            this.session.emit('session_disconnected', {
                sessionId,
                code,
                reason
            });
        };
    }

    /**
     * Handle a permission request
     * @param {boolean} [granted=false] - Whether to grant the permission
     */
    handlePermissionRequest(granted = false) {
        if (!this.websocket) return;
        this.websocket.send(JSON.stringify({
            type: 'external_resource_granted',
            data: { 
                granted,
                resource_type: 'admin_permission_request'
            }
        }));
    }

    /**
     * Handle user input
     * @param {string} [input=''] - The user input
     */
    handleInput(input = '') {
        if (!this.websocket) return;
        this.websocket.send(JSON.stringify({
            type: 'external_resource_granted',
            data: { 
                input,
                resource_type: 'request_user_input',
                granted: true
            }
        }));
    }

    /**
     * Close the WebSocket connection
     * @param {number} code - The close code
     * @param {string} reason - The reason for closing
     */
    close(code, reason) {
        if (this.websocket) {
            this.websocket.close(code, reason);
        }
    }
}

module.exports = WebSocketSessionStrategy;