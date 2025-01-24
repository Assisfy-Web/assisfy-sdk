# Assisfy SDK

The official SDK for interacting with Assisfy's AI Agent Platform. Build, deploy, and manage autonomous AI agents with ease.

## Installation

```bash
npm install assisfy-sdk
# or
yarn add assisfy-sdk
```

## Quick Start

```javascript
const AssisfySDK = require('assisfy-sdk');

// Initialize the SDK
const assisfy = new AssisfySDK({
    apiKey: 'your-api-key',
    environment: 'production' // or 'staging' or 'development'
});

// Create and connect to a session
const session = await assisfy.session().create({
    goal: "Analyze website content",
    url: "https://example.com",
    connectStrategy: 'sse' // or 'websocket'
});

// Listen for events
session.on('session_created', (data) => {
    console.log('Session created:', data);
});

session.on('message', (data) => {
    console.log(`Received ${data.event} event:`, data.data);
});

// Handle permission requests
session.on('message', (data) => {
    if (data.event === 'external_resource_requested') {
        session.handlePermissionRequest(true);
    }
});
```

## Features

- **Multiple Connection Strategies**: Choose between Server-Sent Events (SSE) or WebSocket connections
- **Environment Support**: Production, Staging, and Development environments
- **Auto-Trigger Support**: Schedule recurring agent sessions
- **Type Safety**: Full TypeScript/JSDoc type definitions
- **Event-Driven**: Real-time updates through event listeners
- **Error Handling**: Comprehensive error handling and reporting

## Connection Strategies

### SSE (Default)
Server-Sent Events provide a lightweight, unidirectional connection that's perfect for most use cases:

```javascript
const session = await assisfy.session().create({
    goal: "Your goal here",
    connectStrategy: 'sse' // This is the default
});
```

### WebSocket
For cases where you need bidirectional communication:

```javascript
const session = await assisfy.session().create({
    goal: "Your goal here",
    connectStrategy: 'websocket'
});
```

## Auto-Trigger Configuration

Schedule recurring agent sessions:

```javascript
const session = await assisfy.session().create({
    goal: "Daily website analysis",
    url: "https://example.com",
    withAutoTrigger: {
        interval: 1440, // Run daily (in minutes)
        end_at: '2024-12-31T23:59:59Z',
        start_now: true,
        web_hook_url: 'https://your-webhook.com/endpoint'
    }
});
```

## Event Types

The SDK emits various events that you can listen to:

- `session_created`: When a new session is created
- `session_connected`: When the connection is established
- `session_error`: When an error occurs
- `session_disconnected`: When the connection is closed
- `message`: For all agent events:
  - `started`: Agent session started
  - `browser_started`: Browser automation started
  - `action_run`: Agent performed an action
  - `thoughts_and_memories`: Agent's thought process
  - `external_resource_requested`: Agent needs permission
  - `complete`: Agent completed the task
  - `error`: An error occurred
  - `heartbeat`: Connection health check
  - `connected`: Initial connection established

## Environment Configuration

### Production
```javascript
const assisfy = new AssisfySDK({
    apiKey: 'your-api-key',
    environment: 'production' // Uses assisfy-genesis.cv
});
```

### Staging
```javascript
const assisfy = new AssisfySDK({
    apiKey: 'your-api-key',
    environment: 'staging' // Uses developer.assisfy-genesis.cv
});
```

### Development
```javascript
const assisfy = new AssisfySDK({
    apiKey: 'your-api-key',
    environment: 'development', // Uses localhost
    config: {
        // Optional: Override specific config values
        baseUrl: 'http://localhost:31190/api/v1'
    }
});
```

## Error Handling

The SDK provides detailed error information:

```javascript
try {
    const session = await assisfy.session().create({
        goal: "Your goal here"
    });
} catch (error) {
    console.error('Error creating session:', error.message);
}

session.on('session_error', (error) => {
    console.error('Session error:', error);
});
```

## API Reference

For detailed API documentation, please visit our [API Reference](./wiki/index.html).

## Contributing

Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
