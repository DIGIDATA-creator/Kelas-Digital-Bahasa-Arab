import { Materi, Question, Penilaian } from '../../types';
import { ALL_MAHFUDZOT_LIST, MahfudzotRawItem } from '../../data/mahfudzotData';

export interface MahfudzotQuizConfig {
  scopeType: 'all' | 'range';
  rangeStartNum: number;
  rangeEndNum: number;
  questionMode: 'arab_indo' | 'indo_arab' | 'fill_blank';
  questionCount: 10 | 20 | 30 | 40 | 50;
  quizMode?: 'multiple_choice' | 'voice';
}

export interface MahfudzotItemUnified {
  number: number;
  arabic: string;
  latin?: string;
  translation: string;
  explanation?: string;
  classLevel?: string;
}

export function generateDynamicMahfudzotQuiz(
  materiList: Materi[],
  config: MahfudzotQuizConfig
): Penilaian {
  // 1. Gather all Mahfudzot items from materiList or ALL_MAHFUDZOT_LIST
  const materiMahfudzot = materiList.filter((m) => m.category === 'mahfudzot');

  let allItems: MahfudzotItemUnified[] = [];

  if (materiMahfudzot.length > 0) {
    allItems = materiMahfudzot.map((m, idx) => ({
      number: m.mahfudzot?.number || m.babNumber || idx + 1,
      arabic: m.mahfudzot?.arabic || m.arabicTitle || m.content,
      latin: m.mahfudzot?.latin,
      translation: m.mahfudzot?.translation || m.description || m.title,
      explanation: m.mahfudzot?.explanation || m.content,
    }));
  } else {
    allItems = ALL_MAHFUDZOT_LIST.map((item) => ({
      number: item.number,
      arabic: item.arabic,
      latin: item.latin,
      translation: item.translation,
      explanation: item.explanation,
      classLevel: item.classLevel,
    }));
  }

  // Ensure items are sorted by number
  allItems.sort((a, b) => a.number - b.number);

  // 2. Filter based on scope (Rule b: tidak dapat kurang dari 25 mahfudzot jika range)
  let candidatePool = [...allItems];

  if (config.scopeType === 'range') {
    let start = Math.max(1, config.rangeStartNum);
    let end = config.rangeEndNum;

    // Enforce range of AT LEAST 25 mahfudzot
    if (end - start + 1 < 25) {
      end = start + 24;
    }

    const filtered = allItems.filter((item) => item.number >= start && item.number <= end);
    if (filtered.length >= 25) {
      candidatePool = filtered;
    } else if (filtered.length > 0) {
      // If items within exact numbers are fewer than 25 in database, fallback to available candidate pool
      candidatePool = filtered;
    }
  }

  if (candidatePool.length === 0) {
    candidatePool = [...allItems];
  }

  // 3. Shuffle candidate pool
  const shuffledCandidates = [...candidatePool].sort(() => Math.random() - 0.5);

  // Determine target question count
  const targetCount = config.questionCount;
  const selectedTargets: MahfudzotItemUnified[] = [];

  let idxCycle = 0;
  while (selectedTargets.length < targetCount) {
    selectedTargets.push(shuffledCandidates[idxCycle % shuffledCandidates.length]);
    idxCycle++;
  }

  // Helper pool for distractors
  const globalArabicWords: string[] = [];
  allItems.forEach((item) => {
    const words = item.arabic.trim().split(/\s+/).filter((w) => w.length > 0);
    globalArabicWords.push(...words);
  });

  const isVoiceMode = config.quizMode === 'voice';

  // 4. Generate Questions based on mode
  const questions: Question[] = selectedTargets.map((target, idx) => {
    let questionText = '';
    let questionArabic = '';
    let correctAnswerText = '';
    const optionSet = new Set<string>();

    if (config.questionMode === 'arab_indo') {
      // Mode 1: Arab -> Indonesia
      if (isVoiceMode) {
        questionText = `Ucapkan terjemahan Bahasa Indonesia dari Mahfudzot No. ${target.number} ("${target.arabic}") ke mikrofon:`;
        questionArabic = target.arabic;
        correctAnswerText = target.translation;
      } else {
        questionText = `Apakah terjemahan Bahasa Indonesia yang tepat untuk Mahfudzot No. ${target.number}?`;
        questionArabic = target.arabic;
        correctAnswerText = target.translation;
        optionSet.add(correctAnswerText);

        // Wrong options from other mahfudzot translations
        const otherTranslations = allItems
          .filter((i) => i.number !== target.number)
          .map((i) => i.translation);
        const shuffledOthers = [...otherTranslations].sort(() => Math.random() - 0.5);

        for (const trans of shuffledOthers) {
          if (optionSet.size >= 4) break;
          if (!optionSet.has(trans)) {
            optionSet.add(trans);
          }
        }

        // Generic fallback if options < 4
        const genericFallbacks = [
          'Kebersihan adalah sebagian dari iman.',
          'Waktu lebih berharga daripada emas.',
          'Menuntut ilmu wajib bagi setiap muslim.',
          'Barangsiapa bersabar maka dia beruntung.',
        ];
        let gIdx = 0;
        while (optionSet.size < 4) {
          optionSet.add(genericFallbacks[gIdx % genericFallbacks.length]);
          gIdx++;
        }
      }
    } else if (config.questionMode === 'indo_arab') {
      // Mode 2: Indonesia -> Arab
      if (isVoiceMode) {
        questionText = `Lafalkan/Ucapkan bait Mahfudzot Bahasa Arab untuk terjemahan berikut ke mikrofon:`;
        questionArabic = target.translation;
        correctAnswerText = target.arabic;
      } else {
        questionText = `Manakah bait Mahfudzot Bahasa Arab yang tepat untuk terjemahan berikut?`;
        questionArabic = target.translation; // Displays Indonesian in arabic placeholder or subtitle
        correctAnswerText = target.arabic;
        optionSet.add(correctAnswerText);

        // Wrong options from other mahfudzot arabics
        const otherArabics = allItems
          .filter((i) => i.number !== target.number)
          .map((i) => i.arabic);
        const shuffledOthers = [...otherArabics].sort(() => Math.random() - 0.5);

        for (const ar of shuffledOthers) {
          if (optionSet.size >= 4) break;
          if (!optionSet.has(ar)) {
            optionSet.add(ar);
          }
        }

        const genericFallbacks = [
          'العِلْمُ نُورٌ وَالْجَهْلُ عَارٌ',
          'النَّظَافَةُ مِنَ الإِيمَانِ',
          'الوَقْتُ أَثْمَنُ مِنَ الذَّهَبِ',
          'الصَّبْرُ يُعِينُ عَلَى كُلِّ عَمَلٍ',
        ];
        let gIdx = 0;
        while (optionSet.size < 4) {
          optionSet.add(genericFallbacks[gIdx % genericFallbacks.length]);
          gIdx++;
        }
      }
    } else {
      // Mode 3: fill_blank (Melengkapi kata yang hilang)
      // Split target arabic into words
      const words = target.arabic.trim().split(/\s+/).filter((w) => w.length > 0);

      // Pick target word index (prefer words with length >= 2)
      let wordIndices = words.map((_, i) => i);
      const longWordIndices = wordIndices.filter((i) => words[i].replace(/[^\u0600-\u06FF]/g, '').length >= 2);
      if (longWordIndices.length > 0) {
        wordIndices = longWordIndices;
      }

      const chosenWordIdx = wordIndices[Math.floor(Math.random() * wordIndices.length)];
      const targetWord = words[chosenWordIdx];

      // Replace target word with ( ... )
      const blankedWords = [...words];
      blankedWords[chosenWordIdx] = '( ... )';
      const blankedSentence = blankedWords.join(' ');

      if (isVoiceMode) {
        questionText = `Ucapkan kata Bahasa Arab yang hilang ( ... ) pada Mahfudzot No. ${target.number} berikut ke mikrofon:`;
        questionArabic = blankedSentence;
        correctAnswerText = targetWord;
      } else {
        questionText = `Lengkapilah bagian kata yang hilang ( ... ) pada Mahfudzot berikut:`;
        questionArabic = blankedSentence;
        correctAnswerText = targetWord;
        optionSet.add(correctAnswerText);

        // Distractors: words from OTHER mahfudzot
        const otherWords = globalArabicWords.filter((w) => w !== targetWord);
        const shuffledWords = [...otherWords].sort(() => Math.random() - 0.5);

        for (const w of shuffledWords) {
          if (optionSet.size >= 4) break;
          if (!optionSet.has(w)) {
            optionSet.add(w);
          }
        }

        // Generic word fallbacks if < 4
        const fallbackWords = ['الْعِلْمِ', 'الصَّبْرُ', 'الْعَمَلُ', 'الْخَيْرِ', 'الْحَقُّ'];
        let fIdx = 0;
        while (optionSet.size < 4) {
          optionSet.add(fallbackWords[fIdx % fallbackWords.length]);
          fIdx++;
        }
      }
    }

    let explanationText = `Mahfudzot No. ${target.number}: "${target.arabic}"\nTerjemah: "${target.translation}"`;
    if (target.latin) {
      explanationText += `\nBacaan: (${target.latin})`;
    }

    if (isVoiceMode) {
      return {
        id: `q-dyn-mahf-v-${Date.now()}-${idx}`,
        code: `MFZ-V-${target.number}-${idx + 1}`,
        type: 'essay',
        questionText,
        questionArabic,
        options: [correctAnswerText],
        correctAnswer: correctAnswerText,
        explanation: explanationText,
        points: Math.round(100 / config.questionCount),
      };
    }

    const optionsList = Array.from(optionSet);

    // Shuffle options randomly
    const shuffledOptions = [...optionsList].sort(() => Math.random() - 0.5);
    const correctIndex = shuffledOptions.indexOf(correctAnswerText);

    return {
      id: `q-dyn-mahf-${Date.now()}-${idx}`,
      code: `MFZ-${target.number}-${idx + 1}`,
      type: 'multiple_choice',
      questionText,
      questionArabic,
      options: shuffledOptions,
      correctAnswer: correctIndex,
      explanation: explanationText,
      points: Math.round(100 / config.questionCount),
    };
  });

  // Timer in minutes based on question count (Rule e)
  const timerMinutesMap: Record<number, number> = {
    10: 5,
    20: 10,
    30: 15,
    40: 20,
    50: 25,
  };
  const durationMinutes = timerMinutesMap[config.questionCount] || 10;

  const modeLabels: Record<string, string> = {
    arab_indo: 'Arab ➔ Indonesia',
    indo_arab: 'Indonesia ➔ Arab',
    fill_blank: 'Melengkapi Kata Hilang',
  };

  const scopeLabel =
    config.scopeType === 'range'
      ? `No. ${config.rangeStartNum} - ${config.rangeEndNum}`
      : 'Semua Nomor (1 - 87)';

  const questionCountExpMap: Record<number, number> = {
    10: 15,
    20: 25,
    30: 40,
    40: 60,
    50: 80,
  };
  const bonusExpForQuestions = questionCountExpMap[config.questionCount] || 15;

  return {
    id: isVoiceMode ? `kuis-mahfudzot-voice-${Date.now()}` : `kuis-mahfudzot-dyn-${Date.now()}`,
    code: isVoiceMode ? `KIZ-MFZ-V-${config.questionCount}Q` : `KIZ-MFZ-${config.questionCount}Q`,
    title: `Kuis ${isVoiceMode ? 'Suara ' : ''}Mahfudzot: ${modeLabels[config.questionMode]} (${config.questionCount} Soal - ${scopeLabel})`,
    type: 'kuis',
    category: 'mahfudzot',
    mode: isVoiceMode ? 'voice' : 'multiple_choice',
    babNumber: config.scopeType === 'range' ? config.rangeStartNum : 1,
    durationMinutes,
    passingGrade: 75,
    questions,
    totalPoints: 100,
    bonusExpForQuestions,
    bonusExpForBabs: 0,
    createdAt: new Date().toISOString(),
  };
}
