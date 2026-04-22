import { ECSClient, DescribeServicesCommand } from '@aws-sdk/client-ecs';

/**
 * Vercel Serverless Function: /api/status
 * Queries AWS ECS for service health and pings Upstash Redis.
 */
export default async function handler(req, res) {
  // CORS headers for safety
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const services = [];

  // --- Env var diagnostics ---
  const missingEcs = [];
  if (!process.env.AWS_ACCESS_KEY_ID) missingEcs.push('AWS_ACCESS_KEY_ID');
  if (!process.env.AWS_SECRET_ACCESS_KEY) missingEcs.push('AWS_SECRET_ACCESS_KEY');
  if (!process.env.ECS_CLUSTER_NAME) missingEcs.push('ECS_CLUSTER_NAME');

  // --- 1. Query ECS Services ---
  if (missingEcs.length > 0) {
    const msg = `Missing env vars: ${missingEcs.join(', ')}`;
    console.error('ECS config error:', msg);
    services.push(
      {
        name: 'API Service',
        id: 'dura-api-service',
        status: 'down',
        description: msg,
        runningCount: 0,
        desiredCount: 0,
      },
      {
        name: 'Worker Service',
        id: 'dura-worker-service',
        status: 'down',
        description: msg,
        runningCount: 0,
        desiredCount: 0,
      }
    );
  } else {
    try {
      const ecs = new ECSClient({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });

      const command = new DescribeServicesCommand({
        cluster: process.env.ECS_CLUSTER_NAME,
        services: ['dura-api-task-service-6ib9d6gr', 'dura-worker-service'],
      });

      const response = await ecs.send(command);

      // Maps real ECS service name → { display name, frontend ID }
      const serviceNameMap = {
        'dura-api-task-service-6ib9d6gr': { name: 'API Service', id: 'dura-api-service' },
        'dura-worker-service': { name: 'Worker Service', id: 'dura-worker-service' },
      };

      for (const svc of response.services || []) {
        const running = svc.runningCount ?? 0;
        const desired = svc.desiredCount ?? 0;
        const mapped = serviceNameMap[svc.serviceName];
        let status, description;

        if (desired === 0) {
          status = 'standby';
          description = 'Scaled to zero as a cost-saving measure. Service will wake on demand.';
        } else if (running === desired && running > 0) {
          status = 'operational';
          description = `All ${running} task(s) running normally.`;
        } else if (running < desired) {
          status = 'degraded';
          description = `${running} of ${desired} task(s) running. Service may be starting up or experiencing issues.`;
        } else {
          status = 'down';
          description = 'Service is not responding.';
        }

        services.push({
          name: mapped?.name || svc.serviceName,
          id: mapped?.id || svc.serviceName,
          status,
          description,
          runningCount: running,
          desiredCount: desired,
        });
      }

      // Handle services not found in response (might not exist yet)
      for (const [_ecsName, mapped] of Object.entries(serviceNameMap)) {
        if (!services.find((s) => s.id === mapped.id)) {
          services.push({
            name: mapped.name,
            id: mapped.id,
            status: 'down',
            description: 'Service not found in cluster.',
            runningCount: 0,
            desiredCount: 0,
          });
        }
      }
    } catch (error) {
      console.error('ECS query failed:', error);
      // Surface the actual error so we can diagnose
      const errMsg = error.name
        ? `${error.name}: ${error.message}`
        : error.message || 'Unknown error';
      services.push(
        {
          name: 'API Service',
          id: 'dura-api-service',
          status: 'down',
          description: `ECS query failed — ${errMsg}`,
          runningCount: 0,
          desiredCount: 0,
        },
        {
          name: 'Worker Service',
          id: 'dura-worker-service',
          status: 'down',
          description: `ECS query failed — ${errMsg}`,
          runningCount: 0,
          desiredCount: 0,
        }
      );
    }
  }

  // --- 2. Ping Upstash Redis ---
  try {
    const restUrl = process.env.UPSTASH_REDIS_REST_URL;
    const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!restUrl || !restToken) {
      const missing = [];
      if (!restUrl) missing.push('UPSTASH_REDIS_REST_URL');
      if (!restToken) missing.push('UPSTASH_REDIS_REST_TOKEN');
      throw new Error(`Missing env vars: ${missing.join(', ')}`);
    }

    const redisRes = await fetch(`${restUrl}/ping`, {
      headers: { Authorization: `Bearer ${restToken}` },
    });

    if (redisRes.ok) {
      services.push({
        name: 'Redis (Elasticache)',
        id: 'upstash-redis',
        status: 'operational',
        description: 'Connected and responding to pings.',
      });
    } else {
      const body = await redisRes.text();
      throw new Error(`Redis responded with ${redisRes.status}: ${body}`);
    }
  } catch (error) {
    console.error('Redis ping failed:', error.message);
    services.push({
      name: 'Redis (Elasticache)',
      id: 'upstash-redis',
      status: 'down',
      description: error.message || 'Unable to reach Elasticache Redis.',
    });
  }

  return res.status(200).json({
    timestamp: new Date().toISOString(),
    services,
  });
}

