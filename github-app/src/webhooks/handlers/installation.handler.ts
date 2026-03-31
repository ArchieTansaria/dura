import { Installation } from '../../models/Installation.model.js'
import githubApp from '../../config/github.js'
import { AnalysisQueue } from '../../queues/analysisQueue.js'

export const handleInstallationEvent = async ({ payload }: any) => {
  const { action, installation } = payload;

  console.log("Installation event:", action);

  if (action === "created") {
    console.log("Installation created:", installation.id);
    try {
      // Fetch accessible repositories for the newly created installation
      const octokit = await githubApp.getInstallationOctokit(installation.id);
      
      const { data } = await octokit.request("GET /installation/repositories", {
        per_page: 100,
      });

      console.log(`Initial scan queued for ${data.repositories.length} repos`);
      
      for (const repo of data.repositories) {
        await AnalysisQueue.add(
          'scan-repo',
          { 
            installationId: installation.id, 
            repoFullName: repo.full_name, 
            repoId: repo.id, 
            branch: repo.default_branch || 'main',
            trigger: 'initial_installation' 
          },
          { attempts: 3, backoff: { type: "exponential", delay: 5000 }, removeOnComplete: true }
        );
      }
    } catch (error) {
      console.error("Error queueing initial scans during installation:", error);
    }
  }
  
  if (action !== "deleted") return;

  await Installation.deleteOne({
    installationId: installation.id,
  });

  console.log("Installation deleted:", installation.id);

};