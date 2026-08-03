export interface VocabularyItem {
  id: string;
  arabicWord: string;
  harakat: string;
  indonesianMeaning: string;
  category: string;
}

export const DUEL_VOCABULARY_LIST: VocabularyItem[] = [
  // Peralatan Sekolah & Kantor
  { id: 'v1', arabicWord: 'قَلَمٌ', harakat: 'Qalamun', indonesianMeaning: 'Pulpen / Pena', category: 'Sekolah' },
  { id: 'v2', arabicWord: 'كِتَابٌ', harakat: 'Kitābun', indonesianMeaning: 'Buku Paket', category: 'Sekolah' },
  { id: 'v3', arabicWord: 'مَكْتَبٌ', harakat: 'Maktabun', indonesianMeaning: 'Meja Tulis', category: 'Sekolah' },
  { id: 'v4', arabicWord: 'كُرْسِيٌّ', harakat: 'Kursiyyun', indonesianMeaning: 'Kursi', category: 'Sekolah' },
  { id: 'v5', arabicWord: 'سَبُّورَةٌ', harakat: 'Sabbūratun', indonesianMeaning: 'Papan Tulis', category: 'Sekolah' },
  { id: 'v6', arabicWord: 'مِسْطَرَةٌ', harakat: 'Misṭaratun', indonesianMeaning: 'Penggaris', category: 'Sekolah' },
  { id: 'v7', arabicWord: 'حَقِيبَةٌ', harakat: 'Ḥaqībatun', indonesianMeaning: 'Tas Sekolah', category: 'Sekolah' },
  { id: 'v8', arabicWord: 'مَكْتَبَةٌ', harakat: 'Maktabatun', indonesianMeaning: 'Perpustakaan', category: 'Sekolah' },
  { id: 'v9', arabicWord: 'مَدْرَسَةٌ', harakat: 'Madrasatun', indonesianMeaning: 'Sekolah', category: 'Sekolah' },
  { id: 'v10', arabicWord: 'مِقَصٌّ', harakat: 'Miqaṣṣun', indonesianMeaning: 'Gunting', category: 'Sekolah' },

  // Rumah & Kehidupan Sehari-hari
  { id: 'v11', arabicWord: 'بَيْتٌ', harakat: 'Baytun', indonesianMeaning: 'Rumah', category: 'Rumah' },
  { id: 'v12', arabicWord: 'بَابٌ', harakat: 'Bābun', indonesianMeaning: 'Pintu', category: 'Rumah' },
  { id: 'v13', arabicWord: 'نَافِذَةٌ', harakat: 'Nāfiḏatun', indonesianMeaning: 'Jendela', category: 'Rumah' },
  { id: 'v14', arabicWord: 'مَطْبَخٌ', harakat: 'Maṭbakun', indonesianMeaning: 'Dapur', category: 'Rumah' },
  { id: 'v15', arabicWord: 'سَاعَةٌ', harakat: 'Sā\'atun', indonesianMeaning: 'Jam / Waktu', category: 'Rumah' },
  { id: 'v16', arabicWord: 'مِصْبَاحٌ', harakat: 'Miṣbāḥun', indonesianMeaning: 'Lampu', category: 'Rumah' },
  { id: 'v17', arabicWord: 'مِرْوَحَةٌ', harakat: 'Mirwaḥatun', indonesianMeaning: 'Kipas Angin', category: 'Rumah' },
  { id: 'v18', arabicWord: 'مَالٌ', harakat: 'Mālun', indonesianMeaning: 'Uang', category: 'Rumah' },

  // Transportasi & Tempat
  { id: 'v19', arabicWord: 'سَيَّارَةٌ', harakat: 'Sayyāratun', indonesianMeaning: 'Mobil', category: 'Transportasi' },
  { id: 'v20', arabicWord: 'حَافِلَةٌ', harakat: 'Ḥāfilatun', indonesianMeaning: 'Bus', category: 'Transportasi' },
  { id: 'v21', arabicWord: 'دَرَّاجَةٌ', harakat: 'Darrājatun', indonesianMeaning: 'Sepeda', category: 'Transportasi' },
  { id: 'v22', arabicWord: 'مَسْجِدٌ', harakat: 'Masjidun', indonesianMeaning: 'Masjid', category: 'Tempat' },
  { id: 'v23', arabicWord: 'سُوقٌ', harakat: 'Sūqun', indonesianMeaning: 'Pasar', category: 'Tempat' },
  { id: 'v24', arabicWord: 'مَطَارٌ', harakat: 'Maṭārun', indonesianMeaning: 'Bandara', category: 'Tempat' },

  // Profesi & Orang
  { id: 'v25', arabicWord: 'أُسْتَاذٌ', harakat: 'Ustāḏun', indonesianMeaning: 'Guru Laki-laki', category: 'Profesi' },
  { id: 'v26', arabicWord: 'طَالِبٌ', harakat: 'Ṭālibun', indonesianMeaning: 'Siswa / Murid', category: 'Profesi' },
  { id: 'v27', arabicWord: 'طَبِيبٌ', harakat: 'Ṭabībun', indonesianMeaning: 'Dokter', category: 'Profesi' },
  { id: 'v28', arabicWord: 'تَاجِرٌ', harakat: 'Tājirun', indonesianMeaning: 'Pedagang', category: 'Profesi' },
  { id: 'v29', arabicWord: 'مُهَنْدِسٌ', harakat: 'Muhandisun', indonesianMeaning: 'Insinyur / Arsitek', category: 'Profesi' },
  { id: 'v30', arabicWord: 'مُوَظَّفٌ', harakat: 'Muwaẓẓafun', indonesianMeaning: 'Pegawai / Karyawan', category: 'Profesi' },

  // Makanan & Minuman
  { id: 'v31', arabicWord: 'طَعَامٌ', harakat: 'Ṭa\'āmun', indonesianMeaning: 'Makanan', category: 'Kuliner' },
  { id: 'v32', arabicWord: 'مَاءٌ', harakat: 'Mā\'un', indonesianMeaning: 'Air Minum', category: 'Kuliner' },
  { id: 'v33', arabicWord: 'حَلِيبٌ', harakat: 'Ḥalībun', indonesianMeaning: 'Susu', category: 'Kuliner' },
  { id: 'v34', arabicWord: 'رُزٌّ', harakat: 'Ruzzun', indonesianMeaning: 'Nasi', category: 'Kuliner' },
  { id: 'v35', arabicWord: 'خُبْزٌ', harakat: 'Khubzun', indonesianMeaning: 'Roti', category: 'Kuliner' },
  { id: 'v36', arabicWord: 'شَايٌ', harakat: 'Shāyun', indonesianMeaning: 'Teh', category: 'Kuliner' },
];

export function generateDuelQuestions(count = 5): Array<{
  id: string;
  arabicWord: string;
  harakat: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  category: string;
}> {
  const shuffledVocab = [...DUEL_VOCABULARY_LIST].sort(() => Math.random() - 0.5);
  const selectedVocab = shuffledVocab.slice(0, count);

  return selectedVocab.map((item, idx) => {
    // Generate 3 wrong options from other words
    const wrongPool = DUEL_VOCABULARY_LIST.filter(v => v.id !== item.id);
    const shuffledWrong = wrongPool.sort(() => Math.random() - 0.5).slice(0, 3);
    
    const correctOption = item.indonesianMeaning;
    const wrongOptions = shuffledWrong.map(w => w.indonesianMeaning);

    // Randomize position of correct answer
    const correctIndex = Math.floor(Math.random() * 4);
    const options = [...wrongOptions];
    options.splice(correctIndex, 0, correctOption);

    return {
      id: `dq-${idx + 1}-${Date.now()}`,
      arabicWord: item.arabicWord,
      harakat: item.harakat,
      questionText: `Apa arti dari kata "${item.arabicWord}" (${item.harakat})?`,
      options,
      correctIndex,
      category: item.category,
    };
  });
}
