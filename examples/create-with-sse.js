const assisfy = require('./init');

const asyncTest = async () => {
    const session = await assisfy.session().create({
        goal: "Who is the president of the United States?",
        // Specify SSE as the connection strategy (this is the default)
        connectStrategy: 'sse',
        // Auto trigger configuration is still supported
        // withAutoTrigger: {
        //     interval: 5,
        //     end_at: '2025-01-29T00:00:00Z',
        //     start_now: true,
        //     web_hook_url: 'http://example.com/webhook',
        // }
    });

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

    // The message event now includes more specific event types
    session.on('message', (data) => {
        console.log(`Received ${data.event} event:`, data.data);

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