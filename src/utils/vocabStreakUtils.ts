import { Student, Question, Materi, Penilaian, VocabularyItem } from '../types';

export interface VocabVerificationResult {
  quizVerifiedKosakata: Record<string, boolean>; // vocabId -> boolean
  quizKosakataStreaks: Record<string, number>;  // vocabId -> streak count
}

/**
 * Normalizes text for robust Arabic and Indonesian matching (strips diacritics, extra spaces)
 */
export function cleanArabicOrIndo(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Arabic harakat
    .toLowerCase()
    .trim();
}

/**
 * Maps a quiz question to a VocabularyItem ID by checking vocabId, question code, or matching words
 */
export function matchQuestionToVocabId(
  question: Question,
  allVocabs: VocabularyItem[]
): string | null {
  if (question.vocabId && allVocabs.some(v => v.id === question.vocabId)) {
    return question.vocabId;
  }

  const qArabic = cleanArabicOrIndo(question.questionArabic);
  const qText = cleanArabicOrIndo(question.questionText);

  // 1. Direct match on questionArabic or questionText
  for (const v of allVocabs) {
    const vWord = cleanArabicOrIndo(v.word);
    const vMeaning = cleanArabicOrIndo(v.meaning);

    if (vWord && (qArabic === vWord || qText.includes(vWord))) {
      return v.id;
    }
    if (vMeaning && (qText.includes(vMeaning) || qArabic.includes(vMeaning))) {
      return v.id;
    }
  }

  return null;
}

/**
 * Determines if the student's answer for a question was correct
 */

function isAnswerCorrect(q: Question, userAns: any): boolean {
  if (userAns === undefined || userAns === null) return false;
  
  if (userAns === q.correctAnswer) return true;
  if (typeof userAns === 'number' && typeof q.correctAnswer === 'number' && userAns === q.correctAnswer) return true;
  
  const strUser = String(userAns).trim().toLowerCase();
  const strCorr = String(q.correctAnswer).trim().toLowerCase();
  
  if (strUser === strCorr) return true;

  if (q.options && typeof q.correctAnswer === 'number' && q.options[q.correctAnswer]) {
    const correctOpt = q.options[q.correctAnswer].trim().toLowerCase();
    if (strUser === correctOpt) return true;
  }

  if (q.options && typeof userAns === 'number' && q.options[userAns]) {
    const userOpt = q.options[userAns].trim().toLowerCase();
    if (userOpt === strCorr) return true;
    if (q.options[q.correctAnswer as number] && userOpt === q.options[q.correctAnswer as number].trim().toLowerCase()) return true;
  }

  return false;
}

/**
 * Calculates consecutive correct quiz streaks per vocabulary item for a given student.
 * 
 * Rules specified by user:
 * - 1 Vocabulary Item is VERIFIED via Quiz if student answers correctly in quizzes 3 times consecutively (streak >= 3).
 * - If the vocabulary item does NOT appear in a quiz, that quiz attempt is IGNORED for that item (streak is preserved).
 * - If the vocabulary item APPEARS in a quiz and the student gets it WRONG, the streak for that vocabulary item RESETS to 0.
 */
export function calculateStudentVocabStreaks(
  student: Student,
  materiList: Materi[],
  penilaianList: Penilaian[]
): VocabVerificationResult {
  const quizVerifiedKosakata: Record<string, boolean> = {};
  const quizKosakataStreaks: Record<string, number> = {};

  if (!student || !student.attempts || student.attempts.length === 0) {
    return { quizVerifiedKosakata, quizKosakataStreaks };
  }

  // Gather all vocabularies
  const allVocabs: VocabularyItem[] = [];
  materiList.forEach(m => {
    if (m.vocabularies) {
      allVocabs.push(...m.vocabularies);
    }
  });

  if (allVocabs.length === 0) {
    return { quizVerifiedKosakata, quizKosakataStreaks };
  }

  // Sort attempts by completedAt ascending
  const sortedAttempts = [...student.attempts].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const streakMap: Record<string, number> = {};

  sortedAttempts.forEach(attempt => {
    // Find matching penilaian or use attempt seen questions
    const penilaian = penilaianList.find(p => p.id === attempt.penilaianId || p.title === attempt.penilaianTitle);
    const questions: Question[] = penilaian?.questions || [];

    if (questions.length === 0) return;

    // Track evaluated vocabIds in this attempt (so each vocab is counted once per attempt)
    const evaluatedInThisAttempt = new Set<string>();

    questions.forEach(q => {
      const vocabId = matchQuestionToVocabId(q, allVocabs);
      if (!vocabId || evaluatedInThisAttempt.has(vocabId)) return;

      evaluatedInThisAttempt.add(vocabId);

      const userAns = attempt.answers?.[q.id];
      const correct = isAnswerCorrect(q, userAns);

      if (correct) {
        const currentStreak = (streakMap[vocabId] || 0) + 1;
        streakMap[vocabId] = currentStreak;
        if (currentStreak >= 3) {
          quizVerifiedKosakata[vocabId] = true;
        }
      } else {
        // Reset streak to 0 on wrong answer
        streakMap[vocabId] = 0;
        quizVerifiedKosakata[vocabId] = false;
      }
    });
  });

  Object.assign(quizKosakataStreaks, streakMap);
  return { quizVerifiedKosakata, quizKosakataStreaks };
}
