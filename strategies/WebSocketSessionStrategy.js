const WebSocket = require('ws');

class WebSocketSessionStrategy {
    sessionId;
    websocket;
    sdk;
    session;

    constructor(session, sdk) {
        this.websocket = null;
        this.sessionId = session.sessionId;
        this.sdk = sdk;
        this.session = session;
        this.connectWebSocket();
    }

    connectWebSocket() {
        const { socketUrl } = this.sdk.config;
        const sessionId = this.sessionId;
        const apiKey = this.sdk.apiKey;
        const url = `${socketUrl}?sessionId=${sessionId}&apiKey=${apiKey}`;
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

    handlePermissionRequest(granted = false) {
        this.websocket.send(JSON.stringify({
            type: 'external_resource_granted',
            data: { 
                granted,
                resource_type: 'admin_permission_request'
            }
        }));
    }

    handleInput(input = '') {
        this.websocket.send(JSON.stringify({
            type: 'external_resource_granted',
            data: { 
                input,
                resource_type: 'request_user_input',
                granted: true
            }
        }));
    }

}

module.exports = WebSocketSessionStrategy;