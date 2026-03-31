import { AnalysisQueue } from "../../queues/analysisQueue.js"

export const handlePushEvent = async ({ payload }: any) => {
  try {
    const { ref, repository, installation } = payload
    
    if (!repository || !installation) return;

    // Only scan pushes to the default branch
    const defaultBranch = repository.default_branch || 'main'
    if (ref !== `refs/heads/${defaultBranch}`) {
      return
    }

    const installationId = installation.id
    const repoFullName = repository.full_name
    const repoId = repository.id
    
    if (!installationId || !repoFullName || !repoId) {
      console.log("Missing required push data. Skipping.")
      return;
    }

    console.log(`Push event on default branch: ${repoFullName}`);

    // Add job to queue
    await AnalysisQueue.add(
      'scan-repo',
      { installationId, repoFullName, repoId, branch: defaultBranch, trigger: 'push' },
      { 
        attempts : 3, 
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
      }
    )
    
  } catch (error) {
    console.error("Push handler error:", error);
  }
}
