import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redisConnection.js";
import githubApp from '../config/github.js'
import { analyzeRepository, aggregateRisk } from 'dura-kit'
import { formatPRComment } from '../utils/formatters.js'
import { Analysis } from '../models/Analysis.model.js'

export const prAnalysisWorker = new Worker('prAnalysisQueue', async (job: Job) => {
  const { installationId, repo, repoId, prNumber, branch } = job.data
  const repoUrl = `https://github.com/${repo}`

  console.log(`[pr.worker] Processing PR #${prNumber} from ${repo}`)

  // 1. Create a pending Analysis document
  const analysisDoc = new Analysis({
    installationId,
    repoFullName: repo,
    repoId,
    branch: branch || 'main',
    status: 'processing'
  });
  await analysisDoc.save();

  try {
    //authenticate as installation
    let octokit;
    try {
      octokit = await githubApp.getInstallationOctokit(installationId);
    } catch (err) {
      console.error("[pr.worker] Installation invalid:", installationId);
      await Analysis.deleteOne({ _id: analysisDoc._id });
      return; // no retry
    }
  
    // 2. Run core analysis
    const dependencies = await analyzeRepository({ repoUrl, branch });

    // 3. Aggregate risk
    const summary = aggregateRisk(dependencies);

    // 4. Save to DB
    analysisDoc.dependencies = dependencies as any;
    analysisDoc.summary = summary as any;
    analysisDoc.status = 'ready';
    await analysisDoc.save();
  
    // 5. Post PR comment
    const [owner, repoName] = repo.split("/");
    await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
      owner,
      repo: repoName,
      issue_number: prNumber,
      body: formatPRComment(dependencies)
    })

    console.log(`[pr.worker] Finished PR #${prNumber}`)

  } catch (error: any) {
    console.error(`[pr.worker] Failed PR #${prNumber}:`, error);

    const maxAttempts = job.opts.attempts || 1;
    if (job.attemptsMade < maxAttempts - 1) {
      await Analysis.deleteOne({ _id: analysisDoc._id });
    } else {
      analysisDoc.status = 'failed';
      analysisDoc.error = error.message || 'Unknown error occurred during PR analysis';
      await analysisDoc.save();
    }

    throw error; // bullmq retries
  }
}, 
{
  connection: redisConnection,
  concurrency: 2,
  drainDelay: 10,
  lockDuration: 60000,
  stalledInterval: 300000
})


