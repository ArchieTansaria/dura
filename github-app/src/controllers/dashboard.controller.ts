import { Request, Response } from 'express'
import { Installation } from '../models/Installation.model.js'
import githubApp from '../config/github.js'

/* 
1. Ensure user is logged in
2. Fetch installations linked to user
3. For each installation: Generate installation Octokit, Fetch accessible repos
4. Return structured JSON 
*/
export const dashboard = async (req: Request, res: Response) => {
  try {
    //1
    const userId = req.session.userId

    if (!userId){
      return res.redirect('/login')
    }

    //2
    const installations = await Installation.find({ installedBy: userId })

    if (!installations.length) {
      return res.json({
        installations: [],
        needsInstall: true,
      });
    }

    //3
    const results = await Promise.all(
      installations.map(async (inst) => {
        const octokit = await githubApp.getInstallationOctokit(inst.installationId)

        const { data } = 
          await octokit.request("GET /installation/repositories", {
            per_page: 100,
          });

        return {
          installationId: inst.installationId,
          accountLogin: inst.accountLogin,
          accountType: inst.accountType,
          repos: data.repositories.map((repo) => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            url: repo.html_url,
          }))
        }
      })
    )

    //4
    res.json({
      installations: results,
      needsInstall: false
    }) 

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
}