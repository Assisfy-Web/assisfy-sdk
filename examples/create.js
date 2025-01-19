const assisfy = require('./init');

const asyncTest = async () => {
    const session = await assisfy.session().create({
        goal: "Who is the president of the United States?",
        // Auto trigger every 30 minutes, end at 2025-01-20T00:00:00Z, start at 2025-01-29T00:00:00Z, and send a web hook to https://example.com/webhook
        // include this is you'd like to auto trigger the session
        withAutoTrigger: {
            interval: 5,
            end_at: '2025-01-29T00:00:00Z',
            start_now: true, // if true, the session will start immediately, change to false if you want to start at a specific time
            web_hook_url: 'http://localhost:4001/example-webhook',
        }
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