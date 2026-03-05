const { app } = require('@azure/functions');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = "V5zt8rjni4ZztPDjyK2OAWhQCbG5GczF5jJ44DD9Z5mFG2Ic";
const CLIENT_SECRET = "WbkM3PLu4C4m5IaVXLRjwxY1qLkeRbx8chhK8G7sZpw18y3W3aJS2nUkKMj6XCez";

const tokenFilePath = path.join(__dirname, 'token.json');

async function getAccessToken() {

    const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    // Read refresh token from file
    const tokenData = JSON.parse(fs.readFileSync(tokenFilePath));
    const refreshToken = tokenData.refresh_token;

    const response = await fetch("https://developer.api.autodesk.com/authentication/v2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${basicAuth}`
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(JSON.stringify(data));
    }

    // Save rotated refresh token permanently
    if (data.refresh_token) {
        fs.writeFileSync(tokenFilePath, JSON.stringify({
            refresh_token: data.refresh_token
        }));
    }

    return data.access_token;
}

app.http('reviews', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request) => {
        try {
            const projectId = request.query.get("projectId");

            if (!projectId) {
                return { status: 400, body: "projectId is required" };
            }

            const accessToken = await getAccessToken();

            const reviewsResponse = await fetch(
                `https://developer.api.autodesk.com/construction/reviews/v1/projects/${projectId}/reviews`,
                {
                   headers: {
  Authorization: `Bearer ${token}`,
  "x-user-id": process.env.ACC_USER_ID
}
                }
            );

            const reviewsData = await reviewsResponse.json();

            if (!reviewsResponse.ok) {
                throw new Error(JSON.stringify(reviewsData));
            }

            for (const review of reviewsData.results || []) {

                const versionsResponse = await fetch(
                    `https://developer.api.autodesk.com/construction/reviews/v1/projects/${projectId}/reviews/${review.id}/versions`,
                    {
                        headers: {
                            "Authorization": `Bearer ${accessToken}`
                        }
                    }
                );

                const versionsData = await versionsResponse.json();

                review.versions = versionsResponse.ok ? (versionsData.results || []) : [];
            }

            return {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reviewsData)
            };

        } catch (error) {
            return {
                status: 500,
                body: error.message
            };
        }
    }
});
module.exports = app;