/**
 * Detects potential breaking changes from release notes using rule-based logic.
 * 
 * This function uses a weighted scoring system to classify breaking changes
 * with confidence levels, minimizing false positives through negation detection
 * and keyword strength categorization.
 * 
 * @param {string} releaseText - The release notes text to analyze
 * @returns {{
 *   breaking: "confirmed" | "likely" | "possible" | "unknown",
 *   confidenceScore: number,
 *   signals: {
 *     strong: string[],
 *     medium: string[],
 *     weak: string[],
 *     negated: boolean
 *   }
 * }}
 */
function detectBreakingChange(releaseText) {
  // Handle empty/missing/malformed input
  if (!releaseText || typeof releaseText !== 'string') {
    return {
      breaking: 'unknown',
      confidenceScore: 0,
      signals: {
        strong: [],
        medium: [],
        weak: [],
        negated: false
      }
    };
  }

  const normalizedText = releaseText.trim();
  if (normalizedText.length === 0) {
    return {
      breaking: 'unknown',
      confidenceScore: 0,
      signals: {
        strong: [],
        medium: [],
        weak: [],
        negated: false
      }
    };
  }

  const lowerText = normalizedText.toLowerCase();

  // Define keyword patterns by strength
  const strongPatterns = [
    /breaking\s+change:/i,
    /breaking\s+changes:/i,
    /breaking:/i,
    /⚠️\s*breaking/i,
    /⚠\s*breaking/i,
    /\[breaking\]/i,
    /\(breaking\)/i,
    /^breaking\s+changes?$/im,  
    /^breaking$/im,              
    /breaking\s+changes?\s*$/im,
  ];

  const mediumPatterns = [
    /introduces\s+breaking/i,
    /incompatible\s+change/i,
    /removed\s+support\s+for/i,
    /api\s+has\s+changed/i,
    /api\s+changes/i,
    /backward\s+incompatible/i,
    /not\s+backward\s+compatible/i,
    /not\s+backwards\s+compatible/i,
    /requires\s+migration/i,
    /migration\s+required/i,
    /breaking\s+change\s+in/i,
    /breaking\s+changes\s+in/i,
    /breaking\s+changes?/i,    
    /⚠️\s*breaking\s+changes?/i,
  ];

  const weakPatterns = [
    /\bbreaking\b/i,
    /\bbreaks\b/i,
    /\bmay\s+break\b/i,
    /\bcould\s+break\b/i,
    /\bmight\s+break\b/i
  ];

  // Negation patterns
  const negationPatterns = [
    /no\s+breaking\s+changes?/i,
    /without\s+breaking/i,
    /non-breaking/i,
    /non\s+breaking/i,
    /not\s+a\s+breaking\s+change/i,
    /not\s+breaking/i,
    /no\s+breaking/i,
    /breaking\s+change\s+free/i
  ];

  // Extract matches for each category
  const strongMatches = [];
  const mediumMatches = [];
  const weakMatches = [];
  let hasNegation = false;
  let hasPositiveEvidence = false;

  // Check for strong indicators
  for (const pattern of strongPatterns) {
    const matches = normalizedText.match(pattern);
    if (matches) {
      const matchIndex = normalizedText.toLowerCase().search(pattern);
      
      // Check if this match is within a negation context (within 30 chars of a negation)
      let isNegated = false;
      for (const negPattern of negationPatterns) {
        const negMatch = normalizedText.toLowerCase().match(negPattern);
        if (negMatch) {
          const negIndex = normalizedText.toLowerCase().indexOf(negMatch[0]);
          const distance = Math.abs(matchIndex - negIndex);
          // If the match is within 50 characters of a negation, exclude it
          if (distance < 50) {
            isNegated = true;
            break;
          }
        }
      }
      
      if (!isNegated) {
        const start = Math.max(0, matchIndex - 10);
        const end = Math.min(normalizedText.length, matchIndex + matches[0].length + 40);
        const snippet = normalizedText.substring(start, end).trim();
        if (!strongMatches.includes(snippet)) {
          strongMatches.push(snippet);
          hasPositiveEvidence = true;
        }
      }
    }
  }

  // Check for medium indicators
  for (const pattern of mediumPatterns) {
    const matches = normalizedText.match(pattern);
    if (matches) {
      const matchIndex = normalizedText.toLowerCase().search(pattern);
      
      // Check if this match is within a negation context (within 30 chars of a negation)
      let isNegated = false;
      for (const negPattern of negationPatterns) {
        const negMatch = normalizedText.toLowerCase().match(negPattern);
        if (negMatch) {
          const negIndex = normalizedText.toLowerCase().indexOf(negMatch[0]);
          const distance = Math.abs(matchIndex - negIndex);
          // If the match is within 50 characters of a negation, exclude it
          if (distance < 50) {
            isNegated = true;
            break;
          }
        }
      }
      
      if (!isNegated) {
        const start = Math.max(0, matchIndex - 10);
        const end = Math.min(normalizedText.length, matchIndex + matches[0].length + 40);
        const snippet = normalizedText.substring(start, end).trim();
        if (!mediumMatches.includes(snippet)) {
          mediumMatches.push(snippet);
          hasPositiveEvidence = true;
        }
      }
    }
  }

  // Check for weak indicators (only if not already matched by stronger patterns)
  for (const pattern of weakPatterns) {
    const matches = normalizedText.match(pattern);
    if (matches) {
      // Check if this match is part of a stronger pattern
      const matchIndex = normalizedText.toLowerCase().search(pattern);
      let isPartOfStronger = false;
      
      // Check if it's part of a strong or medium pattern
      for (const strongPattern of strongPatterns) {
        if (strongPattern.test(normalizedText.substring(Math.max(0, matchIndex - 20), Math.min(normalizedText.length, matchIndex + 20)))) {
          isPartOfStronger = true;
          break;
        }
      }
      if (!isPartOfStronger) {
        for (const mediumPattern of mediumPatterns) {
          if (mediumPattern.test(normalizedText.substring(Math.max(0, matchIndex - 20), Math.min(normalizedText.length, matchIndex + 20)))) {
            isPartOfStronger = true;
            break;
          }
        }
      }
      
      if (!isPartOfStronger) {
        // Check if this match is within a negation context
        let isNegated = false;
        for (const negPattern of negationPatterns) {
          const negMatch = normalizedText.toLowerCase().match(negPattern);
          if (negMatch) {
            const negIndex = normalizedText.toLowerCase().indexOf(negMatch[0]);
            const distance = Math.abs(matchIndex - negIndex);
            if (distance < 50) {
              isNegated = true;
              break;
            }
          }
        }
        
        if (!isNegated) {
          const start = Math.max(0, matchIndex - 10);
          const end = Math.min(normalizedText.length, matchIndex + matches[0].length + 40);
          const snippet = normalizedText.substring(start, end).trim();
          if (!weakMatches.includes(snippet)) {
            weakMatches.push(snippet);
            hasPositiveEvidence = true;
          }
        }
      }
    }
  }

  // Check for negation patterns
  // for (const pattern of negationPatterns) {
  //   if (pattern.test(normalizedText)) {
  //     hasNegation = true;
  //     break;
  //   }
  // }

  // Calculate score using weighted system
  let score = 0;
  
  // Strong indicators: +3 each
  score += Math.min(strongMatches.length, 1) * 3;
  
  // Medium indicators: +2 each
  score += Math.min(mediumMatches.length, 1) * 2;
  
  // Weak indicators: +1 each
  score += Math.min(weakMatches.length, 1) * 1;
  
  // Negation: -3 (strong penalty)
  // if (hasNegation) {
  //   score -= 3;
  // }

  // Determine breaking classification based on score
  let breaking;
  if (score >= 3) {
    breaking = 'confirmed';
  } else if (score === 2) {
    breaking = 'likely';
  } else if (score === 1) {
    breaking = 'possible';
  } else {
    breaking = 'unknown';
  }

  // Normalize score to confidence (0-1)
  // Map score range to confidence: 
  // - Score >= 3: high confidence (0.8-1.0)
  // - Score = 2: medium confidence (0.5-0.7)
  // - Score = 1: low confidence (0.2-0.4)
  // - Score <= 0: no confidence (0.0-0.1)
  let confidenceScore;
  if (score >= 3) {
    // Higher scores get higher confidence, capped at 1.0
    confidenceScore = Math.min(0.8 + (score - 3) * 0.05, 1.0);
  } else if (score === 2) {
    confidenceScore = 0.6;
  } else if (score === 1) {
    confidenceScore = 0.3;
  } else {
    // Negative or zero scores get very low confidence
    confidenceScore = Math.max(0.0, 0.1 + score * 0.05);
  }

  return {
    breaking,
    confidenceScore: Math.max(0, Math.min(1, confidenceScore)), // Clamp to [0, 1]
    signals: {
      strong: strongMatches,
      medium: mediumMatches,
      weak: weakMatches,
      negated: hasNegation && !hasPositiveEvidence
    }
  };
}

module.exports = {
  detectBreakingChange
};

