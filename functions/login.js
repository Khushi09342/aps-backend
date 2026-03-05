const { app } = require('@azure/functions');

const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.http('login', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        const authUrl =
            `https://developer.api.autodesk.com/authentication/v2/authorize` +
            `?response_type=code` +
            `&client_id=${CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
            `&scope=data:read account:read`;

        return {
            status: 302,
            headers: {
                Location: authUrl
            }
        };
    }
});