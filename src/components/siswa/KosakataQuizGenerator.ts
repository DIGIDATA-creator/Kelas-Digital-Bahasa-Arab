import { Materi, Question, Penilaian, VocabularyItem } from '../../types';

export interface KosakataQuizConfig {
  scopeType: 'all' | 'specific' | 'range';
  specificBab: number;
  rangeStartBab: number;
  rangeEndBab: number;
  direction: 'arab_indo' | 'indo_arab';
  questionCount: 10 | 20 | 30 | 40 | 50;
  quizMode?: 'multiple_choice' | 'voice';
}

interface VocabFlatItem {
  vocab: VocabularyItem;
  babNumber: number;
  babTitle: string;
}

export function generateDynamicKosakataQuiz(
  materiList: Materi[],
  config: KosakataQuizConfig
): Penilaian {
  const isVoiceMode = config.quizMode === 'voice';

  // 1. Gather all vocabularies from materi of category === 'kosakata'
  const kosakataMateri = materiList.filter(m => m.category === 'kosakata');

  const allFlatVocabs: VocabFlatItem[] = [];
  kosakataMateri.forEach(m => {
    const babNum = m.babNumber || 1;
    (m.vocabularies || []).forEach(v => {
      allFlatVocabs.push({
        vocab: v,
        babNumber: babNum,
        babTitle: m.title,
      });
    });
  });

  // 2. Filter vocabularies based on scope
  let candidatePool = allFlatVocabs.filter(item => {
    if (config.scopeType === 'specific') {
      return item.babNumber === config.specificBab;
    } else if (config.scopeType === 'range') {
      return item.babNumber >= config.rangeStartBab && item.babNumber <= config.rangeEndBab;
    }
    return true; // 'all'
  });

  // Fallback if scope candidatePool is empty or very small
  if (candidatePool.length === 0) {
    candidatePool = [...allFlatVocabs];
  }

  // 3. Randomize order of candidate pool
  const shuffledCandidates = [...candidatePool].sort(() => Math.random() - 0.5);

  // Take up to requested questionCount
  const targetCount = Math.min(config.questionCount, shuffledCandidates.length > 0 ? shuffledCandidates.length : config.questionCount);
  const selectedTargets = shuffledCandidates.slice(0, targetCount);

  // If we have fewer items than requested question count, cycle through candidatePool to reach questionCount
  if (selectedTargets.length < config.questionCount && candidatePool.length > 0) {
    let index = 0;
    while (selectedTargets.length < config.questionCount) {
      selectedTargets.push(candidatePool[index % candidatePool.length]);
      index++;
    }
  }

  // 4. Generate questions according to mode
  const questions: Question[] = selectedTargets.map((target, idx) => {
    const targetBab = target.babNumber;
    const targetVocab = target.vocab;
    const isArabIndo = config.direction === 'arab_indo';

    const correctAnswerText = isArabIndo ? targetVocab.meaning : targetVocab.word;
    const questionArabic = isArabIndo ? targetVocab.word : targetVocab.meaning;

    if (isVoiceMode) {
      // VOICE QUIZ MODE (Web Speech API)
      const questionText = isArabIndo
        ? `Ucapkan terjemahan Bahasa Indonesia dari mufradat "${targetVocab.word}" ke mikrofon:`
        : `Ucapkan mufradat Bahasa Arab untuk kata "${targetVocab.meaning}" ke mikrofon:`;

      return {
        id: `q-dyn-kos-v-${Date.now()}-${idx}`,
        code: `KOS-V-BAB${targetBab}-${idx + 1}`,
        type: 'essay',
        questionText,
        questionArabic,
        correctAnswer: correctAnswerText,
        explanation: `Kosakata "${targetVocab.word}" (${targetVocab.latin || ''}) bermakna "${targetVocab.meaning}". (Bab ${targetBab}: ${target.babTitle}).`,
        points: Math.round(100 / config.questionCount),
        vocabId: targetVocab.id,
        options: [correctAnswerText],
      };
    }

    // MULTIPLE CHOICE MODE (Rule 1 & Rule 2 Fix):
    // - Jika siswa hanya memilih 1 bab (specificBab / 1 bab scope): 2 jawaban salah dari bab yang sama, 1 jawaban salah dari bab yang lain.
    // - Jika siswa memilih rentang bab (rangeStartBab - rangeEndBab): 2 jawaban salah dari rentang bab yang dipilih, 1 jawaban salah dari bab yang tidak dipilih.
    // - Jika memilih semua bab: 2 jawaban salah dari bab yang sama, 1 jawaban salah dari bab yang lain.

    let sameOrInRangeCandidates: VocabFlatItem[] = [];
    let diffOrOutRangeCandidates: VocabFlatItem[] = [];

    if (config.scopeType === 'specific') {
      sameOrInRangeCandidates = allFlatVocabs.filter(
        v => v.babNumber === targetBab && v.vocab.id !== targetVocab.id
      );
      diffOrOutRangeCandidates = allFlatVocabs.filter(
        v => v.babNumber !== targetBab
      );
    } else if (config.scopeType === 'range') {
      sameOrInRangeCandidates = allFlatVocabs.filter(
        v => v.babNumber >= config.rangeStartBab && v.babNumber <= config.rangeEndBab && v.vocab.id !== targetVocab.id
      );
      diffOrOutRangeCandidates = allFlatVocabs.filter(
        v => (v.babNumber < config.rangeStartBab || v.babNumber > config.rangeEndBab)
      );
    } else {
      // 'all'
      sameOrInRangeCandidates = allFlatVocabs.filter(
        v => v.babNumber === targetBab && v.vocab.id !== targetVocab.id
      );
      diffOrOutRangeCandidates = allFlatVocabs.filter(
        v => v.babNumber !== targetBab
      );
    }

    // 2 Distractors from same/in-range candidates
    const shuffledSameOrIn = [...sameOrInRangeCandidates].sort(() => Math.random() - 0.5);
    const sameOrInDistractors: string[] = [];
    shuffledSameOrIn.forEach(v => {
      const txt = isArabIndo ? v.vocab.meaning : v.vocab.word;
      if (txt !== correctAnswerText && !sameOrInDistractors.includes(txt)) {
        if (sameOrInDistractors.length < 2) {
          sameOrInDistractors.push(txt);
        }
      }
    });

    // 1 Distractor from diff/out-of-range candidates
    const shuffledDiffOrOut = [...diffOrOutRangeCandidates].sort(() => Math.random() - 0.5);
    const diffOrOutDistractors: string[] = [];
    shuffledDiffOrOut.forEach(v => {
      const txt = isArabIndo ? v.vocab.meaning : v.vocab.word;
      if (txt !== correctAnswerText && !sameOrInDistractors.includes(txt) && !diffOrOutDistractors.includes(txt)) {
        if (diffOrOutDistractors.length < 1) {
          diffOrOutDistractors.push(txt);
        }
      }
    });

    // Assemble option set
    const optionSet = new Set<string>();
    optionSet.add(correctAnswerText);
    sameOrInDistractors.forEach(d => optionSet.add(d));
    diffOrOutDistractors.forEach(d => optionSet.add(d));

    // Backup pool of any words to ensure we ALWAYS have 4 unique options
    const fallbackOptionsPool = allFlatVocabs
      .filter(v => v.vocab.id !== targetVocab.id)
      .map(v => (isArabIndo ? v.vocab.meaning : v.vocab.word));
    const shuffledFallback = [...fallbackOptionsPool].sort(() => Math.random() - 0.5);

    let fallbackIdx = 0;
    while (optionSet.size < 4 && fallbackIdx < shuffledFallback.length) {
      if (shuffledFallback[fallbackIdx] !== correctAnswerText) {
        optionSet.add(shuffledFallback[fallbackIdx]);
      }
      fallbackIdx++;
    }

    // Generic fallbacks if database has very few words
    const genericFallbacks = isArabIndo
      ? ['Pintu Belajar', 'Halaman Sekolah', 'Jendela Kelas', 'Lampu Penerang']
      : ['مَلْعَبٌ', 'مَكْتَبَةٌ', 'مُدَرِّسٌ', 'مَدْرَسَةٌ'];

    let genericIdx = 0;
    while (optionSet.size < 4) {
      optionSet.add(genericFallbacks[genericIdx % genericFallbacks.length]);
      genericIdx++;
    }

    const optionsList = Array.from(optionSet);

    // Shuffle options randomly
    const shuffledOptions = [...optionsList].sort(() => Math.random() - 0.5);
    const correctIndex = shuffledOptions.indexOf(correctAnswerText);

    const questionText = isArabIndo
      ? `Apakah terjemahan Bahasa Indonesia yang tepat dari mufradat "${targetVocab.word}"?`
      : `Manakah mufradat Bahasa Arab yang tepat untuk kata "${targetVocab.meaning}"?`;

    return {
      id: `q-dyn-kos-${Date.now()}-${idx}`,
      code: `KOS-BAB${targetBab}-${idx + 1}`,
      type: 'multiple_choice',
      questionText,
      questionArabic,
      options: shuffledOptions,
      correctAnswer: correctIndex,
      explanation: `Kosakata "${targetVocab.word}" (${targetVocab.latin || ''}) bermakna "${targetVocab.meaning}". (Bab ${targetBab}: ${target.babTitle}).`,
      points: Math.round(100 / config.questionCount),
      vocabId: targetVocab.id,
    };
  });

  // Calculate timer in minutes
  const timerMinutesMap: Record<number, number> = {
    10: 5,
    20: 10,
    30: 15,
    40: 20,
    50: 25,
  };
  const durationMinutes = timerMinutesMap[config.questionCount] || 10;

  const scopeLabel =
    config.scopeType === 'specific'
      ? `Bab ${config.specificBab}`
      : config.scopeType === 'range'
      ? `Bab ${config.rangeStartBab} s/d ${config.rangeEndBab}`
      : 'Semua Bab';

  const dirLabel = config.direction === 'arab_indo' ? 'Arab ➔ Indonesia' : 'Indonesia ➔ Arab';
  const modeLabel = isVoiceMode ? 'Kuis Suara (Web Speech API)' : 'Pilihan Ganda';

  // Bonus EXP calculations
  const questionCountExpMap: Record<number, number> = {
    10: 15,
    20: 25,
    30: 40,
    40: 60,
    50: 80,
  };
  const bonusExpForQuestions = questionCountExpMap[config.questionCount] || 15;

  let extraBabCount = 0;
  if (config.scopeType === 'range') {
    extraBabCount = Math.max(0, config.rangeEndBab - config.rangeStartBab);
  } else if (config.scopeType === 'all') {
    const uniqueBabsInList = new Set(kosakataMateri.map(m => m.babNumber || 1)).size;
    extraBabCount = Math.max(0, uniqueBabsInList - 1);
  }
  const bonusExpForBabs = extraBabCount * 15;

  return {
    id: isVoiceMode ? `kuis-kosakata-voice-${Date.now()}` : `kuis-kosakata-dyn-${Date.now()}`,
    code: isVoiceMode ? `KIZ-KOS-V-${config.questionCount}Q` : `KIZ-KOS-${config.questionCount}Q`,
    title: `Kuis ${isVoiceMode ? 'Suara ' : ''}Kosakata: ${dirLabel} (${config.questionCount} Soal - ${scopeLabel})`,
    type: 'kuis',
    category: 'kosakata',
    mode: isVoiceMode ? 'voice' : 'multiple_choice',
    babNumber: config.scopeType === 'specific' ? config.specificBab : 1,
    durationMinutes,
    passingGrade: 75,
    questions,
    totalPoints: 100,
    bonusExpForQuestions,
    bonusExpForBabs,
    createdAt: new Date().toISOString(),
  };
}
