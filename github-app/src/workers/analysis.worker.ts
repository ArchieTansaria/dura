import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redisConnection.js";
import { analyzeRepository, aggregateRisk } from 'dura-kit'
import { Analysis } from '../models/Analysis.model.js'

export const analysisWorker = new Worker('AnalysisQueue', async (job: Job) => {
  const { installationId, repoFullName, repoId, branch, trigger } = job.data;
  console.log(`[scan.worker] Starting scan for ${repoFullName} (Trigger: ${trigger})`);

  // 1. Create a pending Analysis document
  const analysisDoc = new Analysis({
    installationId,
    repoFullName,
    repoId,
    branch: branch || 'main',
    status: 'processing'
  });
  await analysisDoc.save();

  try {
    const repoUrl = `https://github.com/${repoFullName}`;

    // 2. Run core analysis
    const dependencies = await analyzeRepository({ repoUrl, branch: branch || 'main', scrapeMode: 'batch' });

    // 3. Aggregate risk
    const summary = aggregateRisk(dependencies);

    // 4. Update the doc
    analysisDoc.dependencies = dependencies as any;
    analysisDoc.summary = summary as any;
    analysisDoc.status = 'ready';
    await analysisDoc.save();

    console.log(`[scan.worker] Finished scan for ${repoFullName}`);

  } catch (error: any) {
    console.error(`[scan.worker] Failed scan for ${repoFullName}:`, error);
    
    const maxAttempts = job.opts.attempts || 1;
    // If this job is going to be retried by BullMQ, delete this pending document to avoid duplicates
    if (job.attemptsMade < maxAttempts - 1) {
      await Analysis.deleteOne({ _id: analysisDoc._id });
    } else {
      // If it's the final attempt, officially mark it as failed
      analysisDoc.status = 'failed';
      analysisDoc.error = error.message || 'Unknown error occurred during analysis';
      await analysisDoc.save();
    }
    
    throw error; 
  }
},
{
  connection: redisConnection,
  concurrency: 2,
  drainDelay: 10,
  lockDuration: 60000,
  stalledInterval: 300000
});

console.log("[scan.worker] Initialized");
