# DURA GitHub App and Backend Infrastructure

This repository contains the backend infrastructure for the Dependency Update Risk Analyzer (DURA) GitHub App. The system is engineered to perform automated, deep-dive dependency analysis on pull requests and repository installations. 

To ensure long-term sustainability and cost-effectiveness, the backend relies on a "Zero-Waste" cloud architecture. The system provisions compute resources exclusively when analysis jobs are actively queued and automatically dismantles those resources when idle.

## Key Features

* **Automated Pull Request Analysis:** The system intercepts `pull_request` webhooks (opened, synchronize) to scan modified `package.json` files and posts structured risk assessments directly to the GitHub timeline.
* **Full Repository Scans:** Upon initial installation, the application queues a comprehensive audit of all accessible repositories to establish a baseline health score.
* **Automated Resource Management:** Worker instances govern their own lifecycle through an event-driven architecture, programmatically scaling down to zero tasks after 10 minutes of queue inactivity.
* **Robust Security Posture:** Integrates strict HMAC SHA-256 signature verification for all incoming payloads and IAM-restricted task execution roles. The API ECS service utilizes a Cloudflare sidecar container for secure, external ingress without requiring an Application Load Balancer.

## Architecture Overview

The system operates on an event-driven architecture utilizing a robust async job processing pipeline powered by BullMQ, Elasticache Redis, AWS Fargate, AWS Lambda, and MongoDB.

The standard request lifecycle follows this path:

1. **GitHub Webhook:** A repository event triggers a payload delivery from GitHub.
2. **Lambda (Wake-up):** An edge AWS Lambda function intercepts the webhook. It acts as a lightweight router, forwarding the payload to the API while simultaneously issuing an `ecs:UpdateService` command to scale the Worker service from 0 to 1.
3. **API (Enqueue):** The Node.js (Express) API receives the payload, verifies the HMAC signature, processes the business logic, and enqueues an analysis job into BullMQ (backed by Elasticache Redis).
4. **Worker (Process):** The newly provisioned Fargate Worker task boots up, connects to Elasticache Redis to fetch the job, and executes the heavy web-scraping and risk calculation tasks. Results are then persisted to MongoDB.
5. **Self-Shutdown:** The Worker continuously monitors its Redis queue state. If the queue remains completely drained for 10 consecutive minutes, the Node.js process executes a final API call to the AWS control plane, scaling its own service `desiredCount` back to 0.

High-level architecture of dura showing request flow, async processing, and worker execution pipeline :

```mermaid
flowchart TB

%% =======================
%% CLIENT + EDGE LAYER
%% =======================
subgraph CLIENT_LAYER ["Client Layer"]
    A1[User Browser]
    A2[GitHub Webhooks]
end

subgraph EDGE_LAYER ["Edge / Ingress Layer"]
    B1[Cloudflare DNS + WAF + TLS]
    B2["Tunnel Routing (Tunnel ID)"]
end

%% =======================
%% API LAYER (ECS)
%% =======================
subgraph ECS_API ["ECS Fargate - API Service"]
    
    subgraph TASK_API ["Task: API + Sidecar"]
        C1[cloudflared Sidecar]
        C2[Node.js API Server]
    end

end

%% =======================
%% ASYNC LAYER
%% =======================
subgraph QUEUE_LAYER ["Queue Layer"]
    D1["Redis (ElastiCache)"]
    D2[BullMQ Queue]
end

subgraph WORKER_LAYER ["Worker Layer (ECS Fargate Tasks)"]
    E1[Worker Container]
    E2[dura-core Analysis Engine]
end

%% =======================
%% SERVERLESS CONTROL
%% =======================
subgraph CONTROL_LAYER ["Control Layer"]
    F1[AWS Lambda Trigger]
end

%% =======================
%% DATA / OUTPUT
%% =======================
subgraph OUTPUT_LAYER ["Output Layer"]
    G1[Database / Storage]
    G2[GitHub PR Comments]
end

%% =======================
%% FLOW: CLIENT → API
%% =======================
A1 -->|HTTPS Request| B1
A2 -->|Webhook| B1

B1 --> B2
B2 -->|Tunnel Connection| C1
C1 -->|localhost:3000| C2

%% =======================
%% FLOW: API → QUEUE
%% =======================
C2 -->|enqueue job| D2
D2 --> D1

%% =======================
%% FLOW: CONTROL → WORKERS
%% =======================
C2 -->|trigger event| F1
F1 -->|RunTask| E1

%% =======================
%% FLOW: WORKER → PROCESS
%% =======================
E1 -->|pull job| D1
E1 --> E2
E2 -->|analysis result| G1
E2 -->|post comment| G2

%% =======================
%% RETURN FLOW
%% =======================
G1 -->|fetch data| C2
C2 -->|response| C1
C1 --> B1
B1 --> A1
```

## Infrastructure Design

The architecture was intentionally designed to be highly durable yet extremely cost-effective.

* **AWS Fargate:** Chosen to eliminate server management overhead while providing isolated, containerized environments for the Node.js API and Worker. The API is designed to run on Fargate Spot instances for baseline cost reduction.
* **AWS Lambda:** Webhooks require immediate response times to prevent timeout penalties from GitHub. A constantly running API would incur idle costs. By placing a Lambda proxy in front of the application, we guarantee sub-second webhook acknowledgement and reliable wake-up triggers for the Fargate worker.
* **Decoupled Workers:** Heavy processing (such as headless browser scraping) is offloaded to a separate Worker service. This prevents the API from experiencing memory exhaustion or event-loop blocking during large repository scans.

## Local Development

For local development without AWS hosting, you must configure the environment variables, set up a GitHub App, and run the services locally.

### 1. Environment Configuration

Create a `.env` file in the `github-app` directory matching the following structure:

```env
NODE_ENV=development
APP_NAME=durakit
APP_URL=https://your-ngrok-or-smee-url
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your_session_secret

# GitHub App Credentials
GITHUB_APP_ID=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=
# Note: Ensure the private key retains explicit newline (\n) characters.
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"

# Database Configuration
REDIS_URL=redis://localhost:6379
MONGODB_URI=mongodb://localhost:27017/dura

# AWS Configuration (Used for Scale-to-Zero logic in production)
AWS_REGION=
ECS_CLUSTER_NAME=
ECS_WORKER_SERVICE_NAME=
IDLE_TIMEOUT_MS=600000
```

### 2. Running the Stack

You can run the entire ecosystem (MongoDB, Redis, API, Worker, and Client) simultaneously using Docker Compose from the root folder:

```bash
cd ..
docker compose up -d
```

Alternatively, you can start the backend services manually:

```bash
# Start the API Service
npm install
npm run dev:app

# Start the Worker Service (in a separate terminal)
npm run dev:worker
```

If you start the services manually, you will also have to manually start the DB and redis instances locally.

**Webhook Routing:** For local testing of GitHub events, you must use a tunneling tool such as `ngrok` or `smee.io` to proxy GitHub webhook payloads to your local API port.

## Deployment

The application is containerized using Docker and deployed via the AWS Elastic Container Registry (ECR) to Elastic Container Service (ECS).

### 1. Build and Push Images
The API and Worker share a codebase but utilize different Dockerfiles to optimize their execution environments. Build and push these images to your ECR repositories:
* API Image: `Dockerfile.api`
* Worker Image: `Dockerfile.worker`

### 2. AWS Lambda Webhook Router
The webhook proxy resides in `/lambda/webhook-router`. It must be deployed as an AWS Lambda function with the following environment variables:

```env
API_WEBHOOK_URL=https://api.yourdomain.com/webhook
ECS_CLUSTER_NAME=your_cluster_name
ECS_WORKER_SERVICE_NAME=your_worker_service_name
AWS_REGION=us-east-1
```

### 3. ECS Services & IAM Permissions
* **API Service:** Deployed as an always-on or Fargate Spot service. In case you are not using an Application Load Balancer (ALB), it is highly recommended to deploy a Cloudflare sidecar container alongside the API task to proxy incoming webhooks securely.
* **Worker Service:** Deployed as an ECS service with a default `desiredCount` of 0.

**Critical IAM Configuration:** Both the Lambda Execution Role and the Worker Task Role **must** possess the `ecs:UpdateService` permission specifically scoped to the Worker Service ARN. Additionally, the API Task Role requires this permission to manually trigger worker wake-ups. Failure to grant these permissions will result in the Worker being unable to execute its self-termination or wake-up logic.
