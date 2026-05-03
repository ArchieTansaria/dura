import { Request, Response } from 'express'
import { Analysis } from '../models/Analysis.model.js'
import { AnalysisQueue } from '../queues/analysisQueue.js'
import { ECSClient, UpdateServiceCommand } from "@aws-sdk/client-ecs";
import { getEnv } from "../utils/envValidator.js";

const ecsClient = new ECSClient({ region: process.env.AWS_REGION || "us-east-1" });

export const getRepoAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { owner, name } = req.params;
    const repoFullName = `${owner}/${name}`;
    
    // Fetch latest analysis
    const analysis = await Analysis.findOne({ repoFullName }).sort({ scannedAt: -1 });

    if (!analysis) {
      return res.status(404).json({ error: "No analysis found for this repository" });
    }

    // Return the data
    return res.json({
      summary: analysis.summary,
      dependencies: analysis.dependencies,
      scannedAt: analysis.scannedAt,
      status: analysis.status
    });

  } catch (error) {
    console.error("Error fetching repo analysis:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const triggerScan = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { owner, name } = req.params;
    const repoFullName = `${owner}/${name}`;

    // Look for the last analysis to get the installation ID and repo ID
    const lastAnalysis = await Analysis.findOne({ repoFullName }).sort({ scannedAt: -1 });
    
    if (!lastAnalysis) {
      return res.status(404).json({ error: "Cannot trigger manual scan on an unscanned repo. Please push a commit or reconnect." });
    }

    await AnalysisQueue.add(
      'scan-repo',
      {
        installationId: lastAnalysis.installationId,
        repoFullName,
        repoId: lastAnalysis.repoId,
        branch: lastAnalysis.branch || 'main',
        trigger: 'manual'
      },
      { attempts: 3, backoff: { type: "exponential", delay: 5000 } }
    );

    // Wake up the worker
    try {
      const cluster = getEnv("ECS_CLUSTER_NAME");
      const service = getEnv("ECS_WORKER_SERVICE_NAME");
      await ecsClient.send(new UpdateServiceCommand({
        cluster,
        service,
        desiredCount: 1
      }));
      console.log(`[manual.trigger] Waking up worker service: ${service}`);
    } catch (ecsError) {
      console.error("[manual.trigger] Failed to wake up worker:", ecsError);
      // We don't fail the request if ECS wake-up fails, as the job is already in Redis 
      // and might be picked up if the worker is already running or scaled by other means.
    }

    return res.status(202).json({ message: "Scan queued successfully" });

  } catch (error) {
    console.error("Error triggering scan:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
