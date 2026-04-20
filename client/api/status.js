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

  // --- 1. Query ECS Services ---
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
      services: ['dura-api-service', 'dura-worker-service'],
    });

    const response = await ecs.send(command);

    const serviceNameMap = {
      'dura-api-service': 'API Service',
      'dura-worker-service': 'Worker Service',
    };

    for (const svc of response.services || []) {
      const running = svc.runningCount ?? 0;
      const desired = svc.desiredCount ?? 0;
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
        name: serviceNameMap[svc.serviceName] || svc.serviceName,
        id: svc.serviceName,
        status,
        description,
        runningCount: running,
        desiredCount: desired,
      });
    }

    // Handle services not found in response (might not exist yet)
    for (const [id, name] of Object.entries(serviceNameMap)) {
      if (!services.find((s) => s.id === id)) {
        services.push({
          name,
          id,
          status: 'down',
          description: 'Service not found in cluster.',
          runningCount: 0,
          desiredCount: 0,
        });
      }
    }
  } catch (error) {
    console.error('ECS query failed:', error.message);
    // If ECS query fails entirely, report both as unknown
    services.push(
      {
        name: 'API Service',
        id: 'dura-api-service',
        status: 'down',
        description: 'Unable to reach AWS ECS. Status check failed.',
        runningCount: 0,
        desiredCount: 0,
      },
      {
        name: 'Worker Service',
        id: 'dura-worker-service',
        status: 'down',
        description: 'Unable to reach AWS ECS. Status check failed.',
        runningCount: 0,
        desiredCount: 0,
      }
    );
  }

  // --- 2. Ping Upstash Redis ---
  try {
    const restUrl = process.env.UPSTASH_REDIS_REST_URL;
    const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!restUrl || !restToken) {
      throw new Error('Upstash REST credentials not configured.');
    }

    const redisRes = await fetch(`${restUrl}/ping`, {
      headers: { Authorization: `Bearer ${restToken}` },
    });

    if (redisRes.ok) {
      services.push({
        name: 'Redis (Upstash)',
        id: 'upstash-redis',
        status: 'operational',
        description: 'Connected and responding to pings.',
      });
    } else {
      throw new Error(`Redis responded with status ${redisRes.status}`);
    }
  } catch (error) {
    console.error('Redis ping failed:', error.message);
    services.push({
      name: 'Redis (Upstash)',
      id: 'upstash-redis',
      status: 'down',
      description: error.message || 'Unable to reach Upstash Redis.',
    });
  }

  return res.status(200).json({
    timestamp: new Date().toISOString(),
    services,
  });
}
