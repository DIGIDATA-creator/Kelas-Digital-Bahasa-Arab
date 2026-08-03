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
  { id: 'v11', arabicWord: 'مِرْسَمٌ', harakat: 'Mirsamun', indonesianMeaning: 'Pensil', category: 'Sekolah' },
  { id: 'v12', arabicWord: 'مِمْحَاةٌ', harakat: 'Mimḥātun', indonesianMeaning: 'Penghapus', category: 'Sekolah' },
  { id: 'v13', arabicWord: 'قِرْطَاسٌ', harakat: 'Qirṭāsun', indonesianMeaning: 'Kertas', category: 'Sekolah' },
  { id: 'v14', arabicWord: 'كُرَّاسَةٌ', harakat: 'Kurrāsatun', indonesianMeaning: 'Buku Tulis', category: 'Sekolah' },
  { id: 'v15', arabicWord: 'فَصْلٌ', harakat: 'Faṣlun', indonesianMeaning: 'Ruang Kelas', category: 'Sekolah' },

  // Rumah & Kehidupan Sehari-hari
  { id: 'v16', arabicWord: 'بَيْتٌ', harakat: 'Baytun', indonesianMeaning: 'Rumah', category: 'Rumah' },
  { id: 'v17', arabicWord: 'بَابٌ', harakat: 'Bābun', indonesianMeaning: 'Pintu', category: 'Rumah' },
  { id: 'v18', arabicWord: 'نَافِذَةٌ', harakat: 'Nāfiḏatun', indonesianMeaning: 'Jendela', category: 'Rumah' },
  { id: 'v19', arabicWord: 'مَطْبَخٌ', harakat: 'Maṭbakun', indonesianMeaning: 'Dapur', category: 'Rumah' },
  { id: 'v20', arabicWord: 'سَاعَةٌ', harakat: 'Sā\'atun', indonesianMeaning: 'Jam / Waktu', category: 'Rumah' },
  { id: 'v21', arabicWord: 'مِصْبَاحٌ', harakat: 'Miṣbāḥun', indonesianMeaning: 'Lampu', category: 'Rumah' },
  { id: 'v22', arabicWord: 'مِرْوَحَةٌ', harakat: 'Mirwaḥatun', indonesianMeaning: 'Kipas Angin', category: 'Rumah' },
  { id: 'v23', arabicWord: 'مَالٌ', harakat: 'Mālun', indonesianMeaning: 'Uang', category: 'Rumah' },
  { id: 'v24', arabicWord: 'سَرِيرٌ', harakat: 'Sarīrun', indonesianMeaning: 'Tempat Tidur', category: 'Rumah' },
  { id: 'v25', arabicWord: 'غُرْفَةٌ', harakat: 'Ghurfatun', indonesianMeaning: 'Kamar / Ruangan', category: 'Rumah' },
  { id: 'v26', arabicWord: 'حَمَّامٌ', harakat: 'Ḥammāmun', indonesianMeaning: 'Kamar Mandi', category: 'Rumah' },
  { id: 'v27', arabicWord: 'تِلْفَازٌ', harakat: 'Tilfāzun', indonesianMeaning: 'Televisi', category: 'Rumah' },

  // Transportasi & Tempat
  { id: 'v28', arabicWord: 'سَيَّارَةٌ', harakat: 'Sayyāratun', indonesianMeaning: 'Mobil', category: 'Transportasi' },
  { id: 'v29', arabicWord: 'حَافِلَةٌ', harakat: 'Ḥāfilatun', indonesianMeaning: 'Bus', category: 'Transportasi' },
  { id: 'v30', arabicWord: 'دَرَّاجَةٌ', harakat: 'Darrājatun', indonesianMeaning: 'Sepeda', category: 'Transportasi' },
  { id: 'v31', arabicWord: 'طَائِرَةٌ', harakat: 'Ṭā\'iratun', indonesianMeaning: 'Pesawat Terbang', category: 'Transportasi' },
  { id: 'v32', arabicWord: 'سَفِينَةٌ', harakat: 'Safīnatun', indonesianMeaning: 'Kapal Laut', category: 'Transportasi' },
  { id: 'v33', arabicWord: 'قِطَارٌ', harakat: 'Qiṭārun', indonesianMeaning: 'Kereta Api', category: 'Transportasi' },
  { id: 'v34', arabicWord: 'مَسْجِدٌ', harakat: 'Masjidun', indonesianMeaning: 'Masjid', category: 'Tempat' },
  { id: 'v35', arabicWord: 'سُوقٌ', harakat: 'Sūqun', indonesianMeaning: 'Pasar', category: 'Tempat' },
  { id: 'v36', arabicWord: 'مَطَارٌ', harakat: 'Maṭārun', indonesianMeaning: 'Bandara', category: 'Tempat' },
  { id: 'v37', arabicWord: 'مَحَطَّةٌ', harakat: 'Maḥaṭṭatun', indonesianMeaning: 'Stasiun', category: 'Tempat' },
  { id: 'v38', arabicWord: 'مُسْتَشْفَى', harakat: 'Mustashfā', indonesianMeaning: 'Rumah Sakit', category: 'Tempat' },

  // Profesi & Orang
  { id: 'v39', arabicWord: 'أُسْتَاذٌ', harakat: 'Ustāḏun', indonesianMeaning: 'Guru Laki-laki', category: 'Profesi' },
  { id: 'v40', arabicWord: 'أُسْتَاذَةٌ', harakat: 'Ustāḏatun', indonesianMeaning: 'Guru Perempuan', category: 'Profesi' },
  { id: 'v41', arabicWord: 'طَالِبٌ', harakat: 'Ṭālibun', indonesianMeaning: 'Siswa / Murid', category: 'Profesi' },
  { id: 'v42', arabicWord: 'طَالِبَةٌ', harakat: 'Ṭālibatun', indonesianMeaning: 'Siswi Perempuan', category: 'Profesi' },
  { id: 'v43', arabicWord: 'طَبِيبٌ', harakat: 'Ṭabībun', indonesianMeaning: 'Dokter', category: 'Profesi' },
  { id: 'v44', arabicWord: 'تَاجِرٌ', harakat: 'Tājirun', indonesianMeaning: 'Pedagang', category: 'Profesi' },
  { id: 'v45', arabicWord: 'مُهَنْدِسٌ', harakat: 'Muhandisun', indonesianMeaning: 'Insinyur / Arsitek', category: 'Profesi' },
  { id: 'v46', arabicWord: 'مُوَظَّفٌ', harakat: 'Muwaẓẓafun', indonesianMeaning: 'Pegawai / Karyawan', category: 'Profesi' },
  { id: 'v47', arabicWord: 'شُرْطِيٌّ', harakat: 'Shurṭiyyun', indonesianMeaning: 'Polisi', category: 'Profesi' },
  { id: 'v48', arabicWord: 'جُنْدِيٌّ', harakat: 'Jundiyyun', indonesianMeaning: 'Tentara', category: 'Profesi' },
  { id: 'v49', arabicWord: 'فَلَّاحٌ', harakat: 'Fallāḥun', indonesianMeaning: 'Petani', category: 'Profesi' },
  { id: 'v50', arabicWord: 'سَائِقٌ', harakat: 'Sā\'iqun', indonesianMeaning: 'Sopir / Pengemudi', category: 'Profesi' },

  // Makanan & Minuman
  { id: 'v51', arabicWord: 'طَعَامٌ', harakat: 'Ṭa\'āmun', indonesianMeaning: 'Makanan', category: 'Kuliner' },
  { id: 'v52', arabicWord: 'مَاءٌ', harakat: 'Mā\'un', indonesianMeaning: 'Air Minum', category: 'Kuliner' },
  { id: 'v53', arabicWord: 'حَلِيبٌ', harakat: 'Ḥalībun', indonesianMeaning: 'Susu', category: 'Kuliner' },
  { id: 'v54', arabicWord: 'رُزٌّ', harakat: 'Ruzzun', indonesianMeaning: 'Nasi', category: 'Kuliner' },
  { id: 'v55', arabicWord: 'خُبْزٌ', harakat: 'Khubzun', indonesianMeaning: 'Roti', category: 'Kuliner' },
  { id: 'v56', arabicWord: 'شَايٌ', harakat: 'Shāyun', indonesianMeaning: 'Teh', category: 'Kuliner' },
  { id: 'v57', arabicWord: 'قَهْوَةٌ', harakat: 'Qahwatun', indonesianMeaning: 'Kopi', category: 'Kuliner' },
  { id: 'v58', arabicWord: 'لَحْمٌ', harakat: 'Laḥmun', indonesianMeaning: 'Daging', category: 'Kuliner' },
  { id: 'v59', arabicWord: 'سَمَكٌ', harakat: 'Samakun', indonesianMeaning: 'Ikan', category: 'Kuliner' },
  { id: 'v60', arabicWord: 'بَيْضٌ', harakat: 'Bayḍun', indonesianMeaning: 'Telur', category: 'Kuliner' },

  // Buah-buahan & Buah
  { id: 'v61', arabicWord: 'فَاكِهَةٌ', harakat: 'Fākihatun', indonesianMeaning: 'Buah-buahan', category: 'Buah' },
  { id: 'v62', arabicWord: 'مَوْزٌ', harakat: 'Mawzun', indonesianMeaning: 'Pisang', category: 'Buah' },
  { id: 'v63', arabicWord: 'تُفَّاحٌ', harakat: 'Tuffāḥun', indonesianMeaning: 'Apel', category: 'Buah' },
  { id: 'v64', arabicWord: 'بُرْتُقَالٌ', harakat: 'Burtuqālun', indonesianMeaning: 'Jeruk', category: 'Buah' },
  { id: 'v65', arabicWord: 'عِنَبٌ', harakat: '‘Inabun', indonesianMeaning: 'Anggur', category: 'Buah' },
  { id: 'v66', arabicWord: 'تَمْرٌ', harakat: 'Tamrun', indonesianMeaning: 'Kurma', category: 'Buah' },

  // Anggota Tubuh
  { id: 'v67', arabicWord: 'رَأْسٌ', harakat: 'Ra\'sun', indonesianMeaning: 'Kepala', category: 'Tubuh' },
  { id: 'v68', arabicWord: 'شَعْرٌ', harakat: 'Sha‘run', indonesianMeaning: 'Rambut', category: 'Tubuh' },
  { id: 'v69', arabicWord: 'عَيْنٌ', harakat: '‘Aynun', indonesianMeaning: 'Mata', category: 'Tubuh' },
  { id: 'v70', arabicWord: 'أُذُنٌ', harakat: 'Uḏunun', indonesianMeaning: 'Telinga', category: 'Tubuh' },
  { id: 'v71', arabicWord: 'أَنْفٌ', harakat: 'Anfun', indonesianMeaning: 'Hidung', category: 'Tubuh' },
  { id: 'v72', arabicWord: 'فَمٌ', harakat: 'Famun', indonesianMeaning: 'Mulut', category: 'Tubuh' },
  { id: 'v73', arabicWord: 'يَدٌ', harakat: 'Yadun', indonesianMeaning: 'Tangan', category: 'Tubuh' },
  { id: 'v74', arabicWord: 'رِجْلٌ', harakat: 'Rijlun', indonesianMeaning: 'Kaki', category: 'Tubuh' },
  { id: 'v75', arabicWord: 'قَلْبٌ', harakat: 'Qalbun', indonesianMeaning: 'Hati / Jantung', category: 'Tubuh' },
  { id: 'v76', arabicWord: 'وَجْهٌ', harakat: 'Wajhun', indonesianMeaning: 'Wajah', category: 'Tubuh' },

  // Warna-warna
  { id: 'v77', arabicWord: 'أَحْمَرُ', harakat: 'Aḥmaru', indonesianMeaning: 'Merah', category: 'Warna' },
  { id: 'v78', arabicWord: 'أَزْرَقُ', harakat: 'Azraqu', indonesianMeaning: 'Biru', category: 'Warna' },
  { id: 'v79', arabicWord: 'أَخْضَرُ', harakat: 'Akhḍaru', indonesianMeaning: 'Hijau', category: 'Warna' },
  { id: 'v80', arabicWord: 'أَصْفَرُ', harakat: 'Aṣfaru', indonesianMeaning: 'Kuning', category: 'Warna' },
  { id: 'v81', arabicWord: 'أَسْوَدُ', harakat: 'Aswadu', indonesianMeaning: 'Hitam', category: 'Warna' },
  { id: 'v82', arabicWord: 'أَبْيَضُ', harakat: 'Abyaḍu', indonesianMeaning: 'Putih', category: 'Warna' },

  // Hari & Waktu
  { id: 'v83', arabicWord: 'السَّبْتُ', harakat: 'As-Sabtu', indonesianMeaning: 'Hari Sabtu', category: 'Waktu' },
  { id: 'v84', arabicWord: 'الأَحَدُ', harakat: 'Al-Aḥadu', indonesianMeaning: 'Hari Minggu', category: 'Waktu' },
  { id: 'v85', arabicWord: 'الإِثْنَيْنِ', harakat: 'Al-Ithnaini', indonesianMeaning: 'Hari Senin', category: 'Waktu' },
  { id: 'v86', arabicWord: 'الثُّلَاثَاءُ', harakat: 'Ath-Thulāthā\'u', indonesianMeaning: 'Hari Selasa', category: 'Waktu' },
  { id: 'v87', arabicWord: 'الأَرْبِعَاءُ', harakat: 'Al-Arbi‘ā\'u', indonesianMeaning: 'Hari Rabu', category: 'Waktu' },
  { id: 'v88', arabicWord: 'الخَمِيسُ', harakat: 'Al-Khamīsu', indonesianMeaning: 'Hari Kamis', category: 'Waktu' },
  { id: 'v89', arabicWord: 'الجُمُعَةُ', harakat: 'Al-Jumu‘atu', indonesianMeaning: 'Hari Jumat', category: 'Waktu' },
  { id: 'v90', arabicWord: 'صَبَاحٌ', harakat: 'Ṣabāḥun', indonesianMeaning: 'Pagi Hari', category: 'Waktu' },
  { id: 'v91', arabicWord: 'مَسَاءٌ', harakat: 'Masā\'un', indonesianMeaning: 'Sore / Malam', category: 'Waktu' },

  // Alam & Lingkungan
  { id: 'v92', arabicWord: 'شَمْسٌ', harakat: 'Shamsun', indonesianMeaning: 'Matahari', category: 'Alam' },
  { id: 'v93', arabicWord: 'قَمَرٌ', harakat: 'Qamarun', indonesianMeaning: 'Bulan', category: 'Alam' },
  { id: 'v94', arabicWord: 'نَجْمٌ', harakat: 'Najmun', indonesianMeaning: 'Bintang', category: 'Alam' },
  { id: 'v95', arabicWord: 'سَمَاءٌ', harakat: 'Samā\'un', indonesianMeaning: 'Langit', category: 'Alam' },
  { id: 'v96', arabicWord: 'أَرْضٌ', harakat: 'Arḍun', indonesianMeaning: 'Bumi / Tanah', category: 'Alam' },
  { id: 'v97', arabicWord: 'جَبَلٌ', harakat: 'Jabalun', indonesianMeaning: 'Gunung', category: 'Alam' },
  { id: 'v98', arabicWord: 'نَهْرٌ', harakat: 'Nahrun', indonesianMeaning: 'Sungai', category: 'Alam' },
  { id: 'v99', arabicWord: 'بَحْرٌ', harakat: 'Baḥrun', indonesianMeaning: 'Laut', category: 'Alam' },
  { id: 'v100', arabicWord: 'مَطَرٌ', harakat: 'Maṭarun', indonesianMeaning: 'Hujan', category: 'Alam' },
  { id: 'v101', arabicWord: 'سَحَابٌ', harakat: 'Saḥābun', indonesianMeaning: 'Awan', category: 'Alam' },

  // Hewan
  { id: 'v102', arabicWord: 'أَسَدٌ', harakat: 'Asadun', indonesianMeaning: 'Singa', category: 'Hewan' },
  { id: 'v103', arabicWord: 'فِيلٌ', harakat: 'Fīlun', indonesianMeaning: 'Gajah', category: 'Hewan' },
  { id: 'v104', arabicWord: 'جَمَلٌ', harakat: 'Jamalun', indonesianMeaning: 'Unta', category: 'Hewan' },
  { id: 'v105', arabicWord: 'قِطٌّ', harakat: 'Qiṭṭun', indonesianMeaning: 'Kucing', category: 'Hewan' },
  { id: 'v106', arabicWord: 'كَلْبٌ', harakat: 'Kalbun', indonesianMeaning: 'Anjing', category: 'Hewan' },
  { id: 'v107', arabicWord: 'طَيْرٌ', harakat: 'Ṭayrun', indonesianMeaning: 'Burung', category: 'Hewan' },

  // Kata Kerja (Verba)
  { id: 'v108', arabicWord: 'قَرَأَ', harakat: 'Qara\'a', indonesianMeaning: 'Membaca', category: 'Kata Kerja' },
  { id: 'v109', arabicWord: 'كَتَبَ', harakat: 'Kataba', indonesianMeaning: 'Menulis', category: 'Kata Kerja' },
  { id: 'v110', arabicWord: 'فَهِمَ', harakat: 'Fahima', indonesianMeaning: 'Memahami', category: 'Kata Kerja' },
  { id: 'v111', arabicWord: 'حَفِظَ', harakat: 'Ḥafiẓa', indonesianMeaning: 'Menghafal', category: 'Kata Kerja' },
  { id: 'v112', arabicWord: 'دَرَسَ', harakat: 'Darasa', indonesianMeaning: 'Belajar', category: 'Kata Kerja' },
  { id: 'v113', arabicWord: 'ذَهَبَ', harakat: 'Ḏahaba', indonesianMeaning: 'Pergi', category: 'Kata Kerja' },
  { id: 'v114', arabicWord: 'رَجَعَ', harakat: 'Raja‘a', indonesianMeaning: 'Pulang / Kembali', category: 'Kata Kerja' },
  { id: 'v115', arabicWord: 'أَكَلَ', harakat: 'Akala', indonesianMeaning: 'Makan', category: 'Kata Kerja' },
  { id: 'v116', arabicWord: 'شَرِبَ', harakat: 'Shariba', indonesianMeaning: 'Minum', category: 'Kata Kerja' },
  { id: 'v117', arabicWord: 'نَامَ', harakat: 'Nāma', indonesianMeaning: 'Tidur', category: 'Kata Kerja' },
  { id: 'v118', arabicWord: 'قَامَ', harakat: 'Qāma', indonesianMeaning: 'Berdiri / Bangun', category: 'Kata Kerja' },
];

export function generateDuelQuestions(count = 10): Array<{
  id: string;
  arabicWord: string;
  harakat: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  category: string;
}> {
  const pool = [...DUEL_VOCABULARY_LIST];
  const selectedVocab: VocabularyItem[] = [];

  let shuffled = pool.sort(() => Math.random() - 0.5);

  while (selectedVocab.length < count) {
    if (shuffled.length === 0) {
      shuffled = [...pool].sort(() => Math.random() - 0.5);
    }
    selectedVocab.push(shuffled.pop()!);
  }

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
      id: `dq-${idx + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      arabicWord: item.arabicWord,
      harakat: item.harakat,
      questionText: `Apa arti dari kata "${item.arabicWord}" (${item.harakat})?`,
      options,
      correctIndex,
      category: item.category,
    };
  });
}

