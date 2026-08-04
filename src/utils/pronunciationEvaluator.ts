/**
 * Utility for evaluating Arabic voice pronunciation accuracy
 * compares student's speech transcript against expected answer
 */

// Helper to strip diacritics and normalize text for comparison
export const normalizeArabicSpeechText = (text: string): string => {
  if (!text) return '';
  
  return String(text)
    // 1. Strip all Arabic diacritics / harakat
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // 2. Normalize alef and hamza variants
    .replace(/[أإآءئؤ]/g, 'ا')
    .replace(/ى/g, 'ي')
    // 3. Process each word individually to normalize speech recognition artifacts for tanwin & ta marbutah
    .split(/\s+/)
    .map(word => {
      let w = word.trim();
      if (!w) return '';

      // Normalize ta marbutah + tanwin nun artifacts at word end
      // (e.g. مدرستن, مدرسهن, مدرسةن, مدرسته -> مدرسه)
      w = w.replace(/(تن|هن|ةن|ته|هت)$/g, 'ه');

      // Normalize trailing nun or waw-nun from dammah tanwin / tanwin phonetics
      // (e.g. كتابن -> كتاب, مدرسن -> مدرس, كتابون -> كتاب)
      if (w.length > 2 && w.endsWith('ون')) {
        w = w.slice(0, -2);
      } else if (w.length > 2 && w.endsWith('ن')) {
        w = w.slice(0, -1);
      }

      // Normalize word-ending Ta Marbutah / Ta / Ha equivalence
      // (e.g. مدرسة / مدرسه / مدرست -> مدرسه)
      w = w.replace(/([ةت])$/g, 'ه');

      return w;
    })
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .trim();
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
  
  // Calculate character distance using Levenshtein distance
  const dist = getLevenshteinDistance(normSpoken, normExpected);
  const maxLen = Math.max(normSpoken.length, normExpected.length, 1);
  const charSimilarity = Math.max(0, (maxLen - dist) / maxLen);

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

export interface LevenshteinAnalysisResult {
  distance: number;
  similarityPercentage: number;
  spokenNorm: string;
  expectedNorm: string;
  errorFeedbackTips: string[];
}

export const getLevenshteinDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const len1 = a.length;
  const len2 = b.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) matrix[i] = [i];
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
};

export const analyzePronunciationError = (
  spokenText: string,
  expectedText: string
): LevenshteinAnalysisResult => {
  const spokenNorm = normalizeArabicSpeechText(spokenText);
  const expectedNorm = normalizeArabicSpeechText(expectedText);

  const dist = getLevenshteinDistance(spokenNorm, expectedNorm);
  const maxLen = Math.max(spokenNorm.length, expectedNorm.length, 1);
  const similarityPercentage = Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100));

  const tips: string[] = [];

  if (spokenNorm === expectedNorm) {
    return {
      distance: 0,
      similarityPercentage: 100,
      spokenNorm,
      expectedNorm,
      errorFeedbackTips: ['Pelafalan sesuai sempurna dengan teks target.'],
    };
  }

  // 1. Check for Ta Marbutah / Ha ending
  if (/[ةهت]$/.test(expectedText) || /[ةهت]$/.test(expectedNorm)) {
    if (!/[ةهت]$/.test(spokenNorm)) {
      tips.push('Akhiran Ta Marbutah (ة/ه): Pastikan menghembuskan bunyi "h" atau "at" jelas di akhir kata.');
    }
  }

  // 2. Check for Dlommah Tanwin / Nun Sukun (un sound)
  if (/[\u064C]/.test(expectedText) || /un$/i.test(expectedText) || expectedText.includes('tanwin')) {
    tips.push('Dlommah Tanwin ( ٌ / un ): Ucapkan vokal "un" artikulatif tanpa menahan bunyi nun sukun terlalu panjang.');
  }

  // 3. Length / word count difference
  const spokenWords = spokenNorm.split(' ').filter(Boolean);
  const expectedWords = expectedNorm.split(' ').filter(Boolean);
  if (spokenWords.length < expectedWords.length) {
    tips.push(`Ada kata yang terlewat (${expectedWords.length - spokenWords.length} kata belum terucap).`);
  } else if (spokenWords.length > expectedWords.length) {
    tips.push('Terdeteksi suara tambahan di luar kata target.');
  }

  // 4. Distance based general tip
  if (dist > 0 && dist <= 3) {
    tips.push(`Hanya terdapat perbedaan ${dist} karakter/bunyi fonetik.`);
  } else if (dist > 3) {
    tips.push('Pelafalan cukup jauh dari target. Coba dengarkan audio contoh lalu ucapkan kembali.');
  }

  return {
    distance: dist,
    similarityPercentage,
    spokenNorm,
    expectedNorm,
    errorFeedbackTips: tips,
  };
};
