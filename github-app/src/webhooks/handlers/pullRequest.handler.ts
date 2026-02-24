import { prAnalysisQueue } from "../../queues/prAnalysisQueue.js"

export const handlePullRequestEvent = async ({ payload }: any) => {
  try {
    const { action, installation } = payload
  
    const allowedActions = ['opened', 'reopened', 'synchronize']
  
    if (!allowedActions.includes(action)){
      return
    }
  
    const installationId = payload.installation.id
    const prNumber = payload.pull_request.number
    const repo = payload.repository.full_name
    const prTitle = payload.pull_request.title
  
    if (!installationId || !prNumber || !repo){
      console.log("Missing required PR data. Skipping.")
      return;
    }
  
    console.log(
      `PR event: ${action} → ${repo} → #${prNumber}`
    );
  
    //add job to queue
    await prAnalysisQueue.add(
      'analyze-pr',
      { installationId, repo, prNumber, prTitle }, 
      { 
        attempts : 3, 
          backoff: {
            type: "exponential",
            delay: 5000,
          },
          removeOnComplete: true,
      }
    )
    
  } catch (error) {
    console.error("PR handler error:", error);
  }

}