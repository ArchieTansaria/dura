import type { DURAResponse, AnalyzeRequest } from '../types/dura';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const analyzeDependencies = async (
  repoUrl: string
): Promise<DURAResponse> => {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ repoUrl } as AnalyzeRequest),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Transform the response to match our expected format
  // The CLI returns an array of dependencies directly
  if (Array.isArray(data)) {
    const dependencies = data;
    const high = dependencies.filter((d) => d.riskLevel === 'high').length;
    const medium = dependencies.filter((d) => d.riskLevel === 'medium').length;
    const low = dependencies.filter((d) => d.riskLevel === 'low').length;

    return {
      dependencies,
      summary: {
        total: dependencies.length,
        high,
        medium,
        low,
      },
      recommendations: generateRecommendations(dependencies),
    };
  }

  return data;
};

function generateRecommendations(dependencies: any[]): string[] {
  const recommendations: string[] = [];
  const highRisk = dependencies.filter((d) => d.riskLevel === 'high');
  const breaking = dependencies.filter((d) => d.breaking);

  if (highRisk.length > 0) {
    recommendations.push(
      `Review ${highRisk.length} high-risk dependency update${highRisk.length > 1 ? 's' : ''} carefully before updating.`
    );
  }

  if (breaking.length > 0) {
    recommendations.push(
      `${breaking.length} dependenc${breaking.length > 1 ? 'ies have' : 'y has'} detected breaking changes. Check release notes before updating.`
    );
  }

  const majorUpdates = dependencies.filter((d) => d.diff === 'major');
  if (majorUpdates.length > 0) {
    recommendations.push(
      `Consider updating ${majorUpdates.length} major version${majorUpdates.length > 1 ? 's' : ''} incrementally with thorough testing.`
    );
  }

  const safeUpdates = dependencies.filter(
    (d) => d.riskLevel === 'low' && d.diff === 'patch'
  );
  if (safeUpdates.length > 0) {
    recommendations.push(
      `${safeUpdates.length} patch update${safeUpdates.length > 1 ? 's are' : ' is'} safe to apply immediately.`
    );
  }

  return recommendations.length > 0 ? recommendations : [
    'All dependencies appear to be up to date or have low risk updates available.',
  ];
}
