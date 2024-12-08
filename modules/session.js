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

    async create(input) {
        try {
            const { data: { data } } = await axios.post(`${this.sdk.config.baseUrl}/sessions`, input, {
                headers: {
                'Content-Type': 'application/json',
                    'x-api-key': this.sdk.apiKey,
                },
            });
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

            socket.on('message', (message) => {
                if (message.event === 'complete') {
                    this.end("Reason='Session completed'");
                }
            });
            return this;
        } catch (error) {
            const { response } = error;
            const { request, ...errorObject } = response;
            throw new Error(errorObject.data.error);
        }
    }

    
}

module.exports = Session;