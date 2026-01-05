import { getCachedResult, setCachedResult, formatFullAnalysis } from "../utils/helper.js";
import { analyzeRepository } from "dura-kit";

@mcp.tool() //does this work

export async function handleFullAnalysis(args) {
  const { repoUrl, branch = "main", useCache = true } = args;

  console.error(`[Full Analysis] ${repoUrl} (${branch})`);

  // check cache
  if (useCache) {
    const cached = getCachedResult(repoUrl, branch);
    if (cached) {
      console.error("Using cached result");
      return {
        content: [
          {
            type: "text",
            text: formatFullAnalysis(cached, true)
          },
        ],
      };
    }
  }

  // Fetch fresh data
  const result = await analyzeRepository({ repoUrl, branch });

  // Cache result
  setCachedResult(repoUrl, branch, result);

  return {
    content: [
      {
        type: "text",
        text: formatFullAnalysis(result, false),
      },
    ],
  };
}