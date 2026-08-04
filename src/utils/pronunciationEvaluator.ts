/**
 * Utility for evaluating Arabic voice pronunciation accuracy
 * compares student's speech transcript against expected answer
 */

// Helper to strip diacritics and normalize text for comparison
export const normalizeArabicSpeechText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // strip harakat/diacritics
    .replace(/[أإآء]/g, 'ا') // normalize alef variants
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

export interface PronunciationEvaluation {
  score: number; // 0 to 100
  tier: 'excellent' | 'good' | 'fair' | 'needs_practice';
  label: string;
  arabicLabel: string;
  badgeColor: string;
  matchedWordsCount: number;
  totalWordsCount: number;
}

export const evaluatePronunciationScore = (
  spokenText: string,
  expectedText: string
): PronunciationEvaluation => {
  if (!spokenText || !spokenText.trim()) {
    return {
      score: 0,
      tier: 'needs_practice',
      label: 'Belum Terdeteksi Suara',
      arabicLabel: 'حاول مرة أخرى',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
      matchedWordsCount: 0,
      totalWordsCount: 0,
    };
  }

  const normSpoken = normalizeArabicSpeechText(spokenText);
  const normExpected = normalizeArabicSpeechText(expectedText);

  if (!normExpected) {
    // If no specific expected answer passed, give high score for fluently recognized speech
    const wordCount = normSpoken.split(' ').filter(Boolean).length;
    const score = Math.min(100, Math.max(75, 70 + wordCount * 5));
    return getEvaluationTier(score, wordCount, wordCount);
  }

  // Exact match
  if (normSpoken === normExpected) {
    return getEvaluationTier(100, normExpected.split(' ').length, normExpected.split(' ').length);
  }

  // Calculate word overlap & Levenshtein distance
  const spokenWords = normSpoken.split(' ').filter(Boolean);
  const expectedWords = normExpected.split(' ').filter(Boolean);

  let matchedWordsCount = 0;
  expectedWords.forEach(expW => {
    if (spokenWords.some(spkW => spkW === expW || spkW.includes(expW) || expW.includes(spkW))) {
      matchedWordsCount++;
    }
  });

  const wordMatchRatio = expectedWords.length > 0 ? (matchedWordsCount / expectedWords.length) : 0;
  
  // Calculate character distance
  const charSimilarity = calculateLevenshteinSimilarity(normSpoken, normExpected);

  // Weighted score
  const finalScore = Math.round(wordMatchRatio * 60 + charSimilarity * 40);

  return getEvaluationTier(finalScore, matchedWordsCount, expectedWords.length);
};

const getEvaluationTier = (score: number, matchedCount: number, totalCount: number): PronunciationEvaluation => {
  const boundedScore = Math.min(100, Math.max(0, score));

  if (boundedScore >= 85) {
    return {
      score: boundedScore,
      tier: 'excellent',
      label: '🌟 Pelafalan Sangat Fasih & Akurat!',
      arabicLabel: 'ممتاز جِدًّا',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs',
      matchedWordsCount: matchedCount,
      totalWordsCount: totalCount,
    };
  } else if (boundedScore >= 70) {
    return {
      score: boundedScore,
      tier: 'good',
      label: '👍 Pelafalan Cukup Baik & Jelas',
      arabicLabel: 'جَيِّدٌ جِدًّا',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-300',
      matchedWordsCount: matchedCount,
      totalWordsCount: totalCount,
    };
  } else if (boundedScore >= 50) {
    return {
      score: boundedScore,
      tier: 'fair',
      label: '🙂 Cukup Baik, Sedikit Perlu Ditata',
      arabicLabel: 'جَيِّدٌ',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
      matchedWordsCount: matchedCount,
      totalWordsCount: totalCount,
    };
  } else {
    return {
      score: boundedScore,
      tier: 'needs_practice',
      label: '💡 Perlu Dipraktikkan Lagi',
      arabicLabel: 'حَاوِلْ مَرَّةً أُخْرَى',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-300',
      matchedWordsCount: matchedCount,
      totalWordsCount: totalCount,
    };
  }
};

function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (!str1 || !str2) return 0;

  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) matrix[i] = [i];
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const dist = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return Math.max(0, (maxLen - dist) / maxLen);
}
