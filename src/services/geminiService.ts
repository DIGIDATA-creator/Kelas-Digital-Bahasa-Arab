import { GoogleGenAI } from '@google/genai';

// Safe initialization of Gemini AI
let aiClient: GoogleGenAI | null = null;

const getGeminiClient = (): GoogleGenAI | null => {
  if (aiClient) return aiClient;
  
  // Look for API Key in standard envs
  const apiKey =
    (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ||
    '';

  if (apiKey) {
    try {
      aiClient = new GoogleGenAI({ apiKey });
      return aiClient;
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }
  return null;
};

export interface HiwarChatMessage {
  id: string;
  sender: 'ai' | 'user';
  arabicText: string;
  translationText?: string;
  pronunciationScore?: number;
  timestamp: string;
}

export const generateHiwarAIResponse = async (
  topicTitle: string,
  chatHistory: HiwarChatMessage[],
  userSpeechText: string
): Promise<{ arabicText: string; translationText: string }> => {
  const client = getGeminiClient();

  if (client) {
    try {
      const historyFormatted = chatHistory
        .map(msg => `${msg.sender === 'ai' ? 'Ustaz AI' : 'Siswa'}: ${msg.arabicText} (${msg.translationText || ''})`)
        .join('\n');

      const prompt = `Anda adalah Ustaz AI, seorang guru bahasa Arab yang ramah dan suportif untuk siswa sekolah.
Topik percakapan: ${topicTitle}.
Riwayat Percakapan:
${historyFormatted}

Siswa baru saja menjawab/berbicara: "${userSpeechText}"

Tugas Anda:
1. Balas pesan siswa dalam Bahasa Arab yang relatif sederhana, komunikatif, dan LENGKAP HARAKAT/TASHKEEL (1-2 kalimat).
2. Sertakan terjemahan Bahasa Indonesia dalam tanda kurung ().
3. Ajukan pertanyaan balik sederhana yang relevan untuk melanjutkan percakapan Hiwar.

Format balasan WAJIB persis seperti berikut (jangan tambahkan teks lain):
[Teks Arab berharakat] | [Terjemahan Bahasa Indonesia dalam kurung]`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const responseText = response.text || '';
      if (responseText.includes('|')) {
        const parts = responseText.split('|');
        return {
          arabicText: parts[0].trim(),
          translationText: parts[1].trim(),
        };
      } else {
        return {
          arabicText: responseText.trim(),
          translationText: '(Mari kita lanjutkan percakapan bahasa Arab!)',
        };
      }
    } catch (err) {
      console.warn('Gemini API call warning, using intelligent Hiwar fallback:', err);
    }
  }

  // Fallback intelligent responses based on topic & turn count if API key is not configured or fails
  return getFallbackHiwarResponse(topicTitle, userSpeechText, chatHistory.length);
};

const getFallbackHiwarResponse = (
  topic: string,
  userSpeech: string,
  turnCount: number
): { arabicText: string; translationText: string } => {
  const normUser = userSpeech.toLowerCase();

  if (normUser.includes('سَلَام') || normUser.includes('salam') || normUser.includes('مَرَّحَب')) {
    return {
      arabicText: 'أَهْلًا وَسَهْلًا بِكَ! كَيْفَ حَالُكَ الْيَوْمَ؟',
      translationText: '(Selamat datang! Bagaimana kabarmu hari ini?)',
    };
  }

  if (normUser.includes('بِخَيْر') || normUser.includes('baik') || normUser.includes('alhamdulillah')) {
    return {
      arabicText: 'الْحَمْدُ لِلَّهِ! مَا اسْمُكَ يَا صَدِيقِي؟',
      translationText: '(Alhamdulillah! Siapa namamu wahai temanku?)',
    };
  }

  if (topic.toLowerCase().includes('sekolah') || topic.toLowerCase().includes('مدرسة')) {
    const responses = [
      {
        arabicText: 'مَاذَا تَدْرُسُ فِي الْمَدْرَسَةِ الْيَوْمَ؟',
        translationText: '(Apa yang kamu pelajari di sekolah hari ini?)',
      },
      {
        arabicText: 'مَمْتَاز! هَلْ تُحِبُّ اللُّغَةَ الْعَرَبِيَّةَ؟',
        translationText: '(Luar biasa! Apakah kamu menyukai Bahasa Arab?)',
      },
      {
        arabicText: 'أَحْسَنْتَ! كَيْفَ ذَهَبْتَ إِلَى الْمَدْرَسَةِ؟',
        translationText: '(Bagus sekali! Bagaimana kamu pergi ke sekolah?)',
      },
    ];
    return responses[turnCount % responses.length];
  }

  if (topic.toLowerCase().includes('pasar') || topic.toLowerCase().includes('سوق')) {
    const responses = [
      {
        arabicText: 'مَاذَا تُرِيدُ أَنْ تَشْتَرِيَ فِي السُّوقِ؟',
        translationText: '(Apa yang ingin kamu beli di pasar?)',
      },
      {
        arabicText: 'كَمْ سِعْرُ هَٰذَا الْكِتَابِ يَا أَخِي؟',
        translationText: '(Berapa harga buku ini wahai saudaraku?)',
      },
    ];
    return responses[turnCount % responses.length];
  }

  // General conversation fallback loop
  const generalResponses = [
    {
      arabicText: 'مَاشَاءَ اللَّهُ! كَلَامُكَ جَمِيلٌ وَوَاضِحٌ جِدًّا.',
      translationText: '(Masya Allah! Ucapannmu sangat bagus dan jelas.)',
    },
    {
      arabicText: 'أَحْسَنْتَ يَا بَطَلُ! هَلْ عِنْدَكَ سُؤَالٌ آخَرُ؟',
      translationText: '(Bagus sekali wahai juara! Apakah kamu ada pertanyaan lain?)',
    },
    {
      arabicText: 'رَائِعٌ جِدًّا! أَنَا سَعِيدٌ بِالْحِوَارِ مَعَكَ الْيَوْمَ.',
      translationText: '(Sangat luar biasa! Saya senang berhiwar denganmu hari ini.)',
    },
  ];

  return generalResponses[turnCount % generalResponses.length];
};
