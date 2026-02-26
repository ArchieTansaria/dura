import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redisConnection.js";
import githubApp from '../config/github.js'

const prAnalysisWorker = new Worker('prAnalysisQueue', async (job: Job) => {
  // const { installationId, repo, prNumber, branch } = job.data

  // const repoUrl = `https://github.com/${repo}`

  // const octokit = await githubApp.getInstallationOctokit(installationId)

  console.log('worker running', job.data)
}, 
{
  connection: redisConnection
})