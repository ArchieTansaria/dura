import 'dotenv/config';
import mongoose from 'mongoose';
import { ECSClient, UpdateServiceCommand } from "@aws-sdk/client-ecs";
import { getEnv } from '../utils/envValidator.js';

// Import worker instances to monitor events
import { prAnalysisWorker } from './pr.worker.js';
import { analysisWorker } from './analysis.worker.js';

// Import queue instances to check job counts
import { prAnalysisQueue } from '../queues/prAnalysisQueue.js';
import { AnalysisQueue } from '../queues/analysisQueue.js';

const ecsClient = new ECSClient({ region: process.env.AWS_REGION || "us-east-1" });

async function connectToDB(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("[workers] DB successfully connected");
  } catch (error) {
    console.error("[workers] connection to db failed", error);
  }
}

connectToDB();

console.log("[workers] All workers initialized and listening to BullMQ queues.");

// --- Idle Monitoring & Self-Termination ---

const IDLE_TIMEOUT = parseInt(process.env.IDLE_TIMEOUT_MS || "600000"); // Default 10 minutes
let idleTimer: NodeJS.Timeout | null = null;

async function checkIdleAndTerminate() {
  // Clear any existing timer
  if (idleTimer) clearTimeout(idleTimer);

  // Check if both queues are truly empty (not just drained but no jobs in progress)
  const [prCounts, analysisCounts] = await Promise.all([
    prAnalysisQueue.getJobCounts('active', 'waiting', 'delayed'),
    AnalysisQueue.getJobCounts('active', 'waiting', 'delayed')
  ]);

  const totalPending = 
    Object.values(prCounts).reduce((a, b) => a + b, 0) + 
    Object.values(analysisCounts).reduce((a, b) => a + b, 0);

  if (totalPending === 0) {
    console.log(`[workers] Queues drained. Starting ${IDLE_TIMEOUT / 60000}m idle timer...`);
    
    idleTimer = setTimeout(async () => {
      console.log("[workers] Idle timeout reached. Performing final sanity check...");
      
      // Final check: Did a job sneak in during the last few milliseconds?
      const [prCounts, analysisCounts] = await Promise.all([
        prAnalysisQueue.getJobCounts('active', 'waiting', 'delayed'),
        AnalysisQueue.getJobCounts('active', 'waiting', 'delayed')
      ]);

      const totalPending = 
        Object.values(prCounts).reduce((a, b) => a + b, 0) + 
        Object.values(analysisCounts).reduce((a, b) => a + b, 0);

      if (totalPending > 0) {
        console.log("[workers] Job detected during final check! Aborting shutdown.");
        idleTimer = null;
        return;
      }

      console.log("[workers] Final check passed. Initiating self-termination...");
      
      try {
        const cluster = getEnv("ECS_CLUSTER_NAME");
        const service = getEnv("ECS_WORKER_SERVICE_NAME");

        // Set desired count to 0
        await ecsClient.send(new UpdateServiceCommand({
          cluster,
          service,
          desiredCount: 0
        }));

        console.log(`[workers] Successfully requested scale-down for ${service}. Shutting down.`);
        
        // Graceful cleanup
        await Promise.all([
          prAnalysisWorker.close(),
          analysisWorker.close()
        ]);
        await mongoose.disconnect();
        
        process.exit(0);
      } catch (err) {
        console.error("[workers] Self-termination failed:", err);
      }
    }, IDLE_TIMEOUT);
  }
}

// Listen for drained events
prAnalysisWorker.on('drained', () => {
  console.log("[workers] PR Analysis queue drained.");
  checkIdleAndTerminate();
});

analysisWorker.on('drained', () => {
  console.log("[workers] General Analysis queue drained.");
  checkIdleAndTerminate();
});

// If a job starts, cancel any pending idle timer
const resetTimer = () => {
  if (idleTimer) {
    console.log("[workers] New job detected. Resetting idle timer.");
    clearTimeout(idleTimer);
    idleTimer = null;
  }
};

prAnalysisWorker.on('active', resetTimer);
analysisWorker.on('active', resetTimer);

// Initial check on startup
checkIdleAndTerminate();
