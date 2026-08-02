import { Materi, Question, Penilaian, VocabularyItem } from '../../types';

export interface KosakataQuizConfig {
  scopeType: 'all' | 'specific' | 'range';
  specificBab: number;
  rangeStartBab: number;
  rangeEndBab: number;
  direction: 'arab_indo' | 'indo_arab';
  questionCount: 10 | 20 | 30 | 40 | 50;
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

  // 3. Randomize order of candidate pool (Rule 2.1d: Kosakata pada nomor soal beda)
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

  // 4. Generate 4 choices for each question (Rule 2.1a):
  // 1 correct answer, 1 distractor from SAME BAB, 2 distractors from DIFFERENT BABS
  const questions: Question[] = selectedTargets.map((target, idx) => {
    const targetBab = target.babNumber;
    const targetVocab = target.vocab;

    const isArabIndo = config.direction === 'arab_indo';
    const correctAnswerText = isArabIndo ? targetVocab.meaning : targetVocab.word;

    // Distractor 1: Same Bab (excluding target)
    const sameBabCandidates = allFlatVocabs.filter(
      v => v.babNumber === targetBab && v.vocab.id !== targetVocab.id
    );
    let distractorSame: string | null = null;
    if (sameBabCandidates.length > 0) {
      const randomSame = sameBabCandidates[Math.floor(Math.random() * sameBabCandidates.length)];
      distractorSame = isArabIndo ? randomSame.vocab.meaning : randomSame.vocab.word;
    }

    // Distractor 2 & 3: Different Babs
    const diffBabCandidates = allFlatVocabs.filter(v => v.babNumber !== targetBab);
    let distractorDiff1: string | null = null;
    let distractorDiff2: string | null = null;

    if (diffBabCandidates.length >= 2) {
      const shuffledDiff = [...diffBabCandidates].sort(() => Math.random() - 0.5);
      distractorDiff1 = isArabIndo ? shuffledDiff[0].vocab.meaning : shuffledDiff[0].vocab.word;
      distractorDiff2 = isArabIndo ? shuffledDiff[1].vocab.meaning : shuffledDiff[1].vocab.word;
    } else if (diffBabCandidates.length === 1) {
      distractorDiff1 = isArabIndo ? diffBabCandidates[0].vocab.meaning : diffBabCandidates[0].vocab.word;
    }

    // Backup pool of any words to ensure we ALWAYS have 4 unique options
    const fallbackOptionsPool = allFlatVocabs
      .filter(v => v.vocab.id !== targetVocab.id)
      .map(v => (isArabIndo ? v.vocab.meaning : v.vocab.word));
    const shuffledFallback = [...fallbackOptionsPool].sort(() => Math.random() - 0.5);

    const optionSet = new Set<string>();
    optionSet.add(correctAnswerText);

    if (distractorSame && distractorSame !== correctAnswerText) {
      optionSet.add(distractorSame);
    }

    if (distractorDiff1 && !optionSet.has(distractorDiff1)) {
      optionSet.add(distractorDiff1);
    }

    if (distractorDiff2 && !optionSet.has(distractorDiff2)) {
      optionSet.add(distractorDiff2);
    }

    // Fill remaining up to 4 options from fallback pool
    let fallbackIdx = 0;
    while (optionSet.size < 4 && fallbackIdx < shuffledFallback.length) {
      optionSet.add(shuffledFallback[fallbackIdx]);
      fallbackIdx++;
    }

    // If still less than 4 (e.g. database has very few total words), add generic fallback options
    const genericFallbacks = isArabIndo
      ? ['Pintu Belajar', 'Halaman Sekolah', 'Jendela Kelas', 'Lampu Penerang']
      : ['مَلْعَبٌ', 'مَكْتَبَةٌ', 'مُدَرِّسٌ', 'مَدْرَسَةٌ'];

    let genericIdx = 0;
    while (optionSet.size < 4) {
      optionSet.add(genericFallbacks[genericIdx % genericFallbacks.length]);
      genericIdx++;
    }

    const optionsList = Array.from(optionSet);

    // Shuffle options randomly (Rule 2.1d: Posisi jawaban benar antar siswa beda)
    const shuffledOptions = [...optionsList].sort(() => Math.random() - 0.5);
    const correctIndex = shuffledOptions.indexOf(correctAnswerText);

    // Question texts
    const questionText = isArabIndo
      ? `Apakah terjemahan Bahasa Indonesia yang tepat dari mufradat "${targetVocab.word}"?`
      : `Manakah mufradat Bahasa Arab yang tepat untuk kata "${targetVocab.meaning}"?`;

    const questionArabic = isArabIndo ? targetVocab.word : targetVocab.meaning;

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
    };
  });

  // Calculate timer in minutes (Rule 2.1e)
  // 10 -> 5 mins, 20 -> 10 mins, 30 -> 15 mins, 40 -> 20 mins, 50 -> 25 mins
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

  return {
    id: `kuis-kosakata-dyn-${Date.now()}`,
    code: `KIZ-KOS-${config.questionCount}Q`,
    title: `Kuis Kosakata: ${dirLabel} (${config.questionCount} Soal - ${scopeLabel})`,
    type: 'kuis',
    category: 'kosakata',
    babNumber: config.scopeType === 'specific' ? config.specificBab : 1,
    durationMinutes,
    passingGrade: 75,
    questions,
    totalPoints: 100,
    createdAt: new Date().toISOString(),
  };
}
