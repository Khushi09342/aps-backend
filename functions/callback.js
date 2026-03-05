const { app } = require('@azure/functions');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const tokenFilePath = path.join(__dirname, 'token.json');

app.http('callback', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {

            const code = request.query.get('code');

            if (!code) {
                return { status: 400, body: "Authorization code missing" };
            }

            const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

            const response = await fetch(
                "https://developer.api.autodesk.com/authentication/v2/token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Authorization": `Basic ${basicAuth}`
                    },
                    body:
                        `grant_type=authorization_code` +
                        `&code=${code}` +
                        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(JSON.stringify(data));
            }

            // Save refresh token permanently
            fs.writeFileSync(tokenFilePath, JSON.stringify({
                refresh_token: data.refresh_token
            }, null, 2));

            return {
                status: 200,
                body: "Authorization successful. You can close this window."
            };

        } catch (error) {
            return {
                status: 500,
                body: error.message
            };
        }
    }
});