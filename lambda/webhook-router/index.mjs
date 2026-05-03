import { ECSClient, UpdateServiceCommand } from "@aws-sdk/client-ecs";

const ecsClient = new ECSClient({ region: process.env.AWS_REGION || "us-east-1" });

export const handler = async (event) => {
    const apiWebhookUrl = process.env.API_WEBHOOK_URL;
    const cluster = process.env.ECS_CLUSTER_NAME;
    const service = process.env.ECS_WORKER_SERVICE_NAME;

    console.log(`[proxy] Received webhook for event: ${event.headers['x-github-event']}`);

    try {
        // 1. Forward the request to the API
        // We pass through the raw body and the critical GitHub headers
        const response = await fetch(apiWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Delivery': event.headers['x-github-delivery'],
                'X-GitHub-Event': event.headers['x-github-event'],
                'X-Hub-Signature-256': event.headers['x-hub-signature-256'],
                'User-Agent': event.headers['user-agent']
            },
            body: event.body
        });

        const status = response.status;
        const responseText = await response.text();

        console.log(`[proxy] API responded with status ${status}: ${responseText}`);

        // 2. If the API accepted the job (2xx), wake up the worker
        if (status >= 200 && status < 300) {
            console.log(`[proxy] Job accepted. Waking up worker service: ${service}`);
            
            // Fire and forget the ECS wake-up call to keep the response time fast
            ecsClient.send(new UpdateServiceCommand({
                cluster,
                service,
                desiredCount: 1
            })).catch(err => console.error("[proxy] Failed to wake up worker:", err));

            return {
                statusCode: status,
                body: responseText
            };
        } else {
            // If the API failed, we return the failure to GitHub so it can retry
            return {
                statusCode: status,
                body: `API failed: ${responseText}`
            };
        }

    } catch (error) {
        console.error("[proxy] Request forwarding failed:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to forward webhook", details: error.message })
        };
    }
};
