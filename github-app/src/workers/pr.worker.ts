import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redisConnection.js";
import githubApp from '../config/github.js'
import { analyzeRepository } from 'dura-kit'
import { formatPRComment } from '../utils/formatters.js'

const prAnalysisWorker = new Worker('prAnalysisQueue', async (job: Job) => {
  try {
    const { installationId, repo, prNumber, branch } = job.data
    const repoUrl = `https://github.com/${repo}`

    console.log(`Processing PR #${prNumber} from ${repo}`)
  
    //authenticate as installation
    let octokit;
    try {
      octokit = await githubApp.getInstallationOctokit(installationId);
    } catch (err) {
      console.error("Installation invalid:", installationId);
      return; // no retry
    }
  
    //call dura core
    const result = await analyzeRepository({repoUrl, branch})
  
    const [owner, repoName] = repo.split("/");

    //post comment
    await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
      owner,
      repo: repoName,
      issue_number: prNumber,
      body: formatPRComment(result)
    })

    console.log(`Finished PR #${prNumber}`)

  } catch (error) {
    console.error("Worker error:", error);
    throw error;  // bullmq retries
  }
}, 
{
  connection: redisConnection,
  concurrency: 2,
  drainDelay: 10,
  lockDuration: 60000,
  stalledInterval: 300000
})

