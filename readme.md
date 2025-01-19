# Assisfy SDK

The Assisfy SDK allows developers to integrate Assisfy's AI capabilities into their applications. This SDK provides a simple interface to create and manage sessions, handle events, and interact with external resources.

![Assisfy SDK](./image.png)

## Installation

To install the Assisfy SDK, use npm:

```bash
npm install assisfy-sdk@latest
```

## Generating API Keys

To use the Assisfy SDK, you need to generate an API key from the Assisfy platform. Follow these steps:

1. Visit [Assisfy Console](https://app.assisfy.ai).
2. Onboard your agent by following the platform's instructions.
3. Navigate to the "API Key" tab.
4. Copy the generated API key for use in your application.

## Usage

Below is an example of how to use the Assisfy SDK to create a session and handle various events.

```javascript
const sdk = require('assisfy-sdk');

const assisfy = new sdk({
    apiKey: "your-api-key-here",
    environment: "production", // or "development"
});

const asyncTest = async () => {
    const session = await assisfy.session().create({
        goal: "Who is the president of the United States?",
    });

    // start session with auto trigger
    // Auto trigger every 30 minutes, end at 2025-01-20T00:00:00Z, start at 2025-01-29T00:00:00Z, and send a web hook to https://example.com/webhook
    // include this is you'd like to auto trigger the session

    // const session = await assisfy.session().create({
    //     goal: "Go through https://assisfy.ai/blog and let me know the latest update on the blog",
    //     withAutoTrigger: {
    //         interval: 30,
    //         end_at: '2025-01-20T00:00:00Z',
    //         start_at: '2025-01-29T00:00:00Z',
    //         web_hook_url: 'https://example.com/webhook',
    //     }
    // });

    session.on('session_created', (data) => {
        console.log('session_created', data);
    });

    session.on('session_connected', (data) => {
        console.log('session_connected', data);
    });

    session.on('session_error', (data) => {
        console.log('session_error', data);
    });

    session.on('session_disconnected', (data) => {
        console.log('session_disconnected', data);
    });

    session.on('message', (data) => {
        console.log('message', data);
        if (data.event === 'complete') {
            console.dir(data.data.cost_summary, { depth: null });
        }

        if (data.event === 'external_resource_requested') {
            console.log('external_resource_requested', data.data);
            if (data.data.resource_type === 'admin_permission_request') {
                session.handlePermissionRequest(true);
            }
            if (data.data.resource_type === 'request_user_input') {
                session.handleInput('test');
            }
        }
    });
}

asyncTest();
```

## API Reference

### Initialization

To initialize the SDK, create a new instance with your API key and environment:

```javascript
const assisfy = new sdk({
    apiKey: "your-api-key-here",
    environment: "production", // or "development"
});
```

### Creating a Session

To create a session, use the `create` method with a goal:

```javascript
const session = await assisfy.session().create({
    goal: "Your goal here",
});
```

### Event Handling

The session object emits several events that you can listen to:

- `session_created`: Fired when a session is successfully created.
- `session_connected`: Fired when a session is connected.
- `session_error`: Fired when there is an error in the session.
- `session_disconnected`: Fired when a session is disconnected.
- `message`: Fired when a message is received. This event can include sub-events like `complete` and `external_resource_requested`.

### Handling External Resources

When a message event with `external_resource_requested` is received, you can handle it by checking the `resource_type` and responding accordingly:

```javascript
session.on('message', (data) => {
    if (data.event === 'complete') {
        console.dir(data.data.cost_summary, { depth: null });
    }

    if (data.event === 'external_resource_requested') {
        console.log('external_resource_requested', data.data);
        if (data.data.resource_type === 'admin_permission_request') {
            session.handlePermissionRequest(true);
        }
        if (data.data.resource_type === 'request_user_input') {
            session.handleInput('test');
        }
    }
});
```

### Auto Trigger
Auto trigger allows you to trigger a job that runs at some interval. 
This requires starting the session like so

```javascript
    // start session with auto trigger
    // Auto trigger every 30 minutes, end at 2025-01-20T00:00:00Z, start at 2025-01-29T00:00:00Z, and send a web hook to https://example.com/webhook
    // include this is you'd like to auto trigger the session

    const session = await assisfy.session().create({
        goal: "Go through https://assisfy.ai/blog and let me know the latest update on the blog",
        withAutoTrigger: {
            interval: 30,
            end_at: '2025-01-20T00:00:00Z',
            start_at: '2025-01-29T00:00:00Z',
            web_hook_url: 'https://example.com/webhook',
        }
    });

    // your sessions will respond with the following object
```

With this approach, you will not be able to use the socket session but rely on the webhook events to listen to activities
All activities here include:
```
- trigger.session.started
- trigger.action.run
- trigger.external.resource.requested
- trigger.thoughts.and.memories
- trigger.browser.started
- trigger.complete
- trigger.error
```

Your webhook will receive this type of event for example
```
{
    event: 'trigger.action.run',
    data: {
        ...other data information,
        tracking_id: activity.tracking_id
    },
}
```
and so on

It'll be important to handle the external resource request just like we'd normally would.
As of SDK v1.5.0, we now allow `.connect()` method which allows you to connect to an existing session.

For every new session that is started via the auto trigger, you'll receive the `trigger.session.started` event which contains a `sessionId` on it's body
This means that you can pass the sessionId to the method like so `const session = await sdk.session().connect('1234567890');` 
After your webhook receive this event, based on your judgement of the task of the agent, you should connect to the session so you can handle the permission and resource request

```javascript
const session = await sdk.session().connect('your_session_id_here');
session.on('message', (data) => {
    if (data.event === 'complete') {
        console.dir(data.data.cost_summary, { depth: null });
    }

    if (data.event === 'external_resource_requested') {
        console.log('external_resource_requested', data.data);
        if (data.data.resource_type === 'admin_permission_request') {
            session.handlePermissionRequest(true);
        }
        if (data.data.resource_type === 'request_user_input') {
            session.handleInput('test');
        }
    }
});
```

## Examples

Kindly see the `examples` folder on how to create a session and connect with other sessions respectively

## License

This SDK is licensed under the MIT License. See the LICENSE file for more information.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## Support

For support, please contact [williams@assisfy.ai](mailto:williams@assisfy.ai).
