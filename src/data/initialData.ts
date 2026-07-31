import { Materi, Penilaian, Student, ActivityLog } from '../types';

// Sample PDF Base64 fallback or data helper
export const SAMPLE_PDF_BASE64 = `data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbXgNc3RhdHVzIG9rCmVuZHN0cmVhbQplbmRvYmoKMyAwIG9iagoxOQplbmRvYmoKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgNCAwIFI+PgplbmRvYmoKNCAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1sgNSAwIFJdPj4KZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9QYWdlL1BhcmVudCA0IDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNiAwIFI+Pj4+L01lZGlhQm94WzAgMCA1OTUgODQyXS9Db250ZW50cyAyIDAgUj4+CmVuZG9iaiA2IDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGb250L0hlbHZldGljYT4+CmVuZG9iagp0cmFpbGVyCjw8L1NpemUgNy9Sb290IDEgMCBSPj4KJSVFT0Y=`;

export const INITIAL_MATERI: Materi[] = [
  // 1. QOWAID
  {
    id: 'mat-qowaid-1',
    title: 'Pengenalan Isim, Fi\'il, dan Harf',
    arabicTitle: 'الاسم والفعل والحرف',
    category: 'qowaid',
    level: 'Dasar',
    description: 'Memahami 3 pembagian kata dasar dalam Bahasa Arab beserta ciri-ciri khas masing-masing.',
    content: `### Pembagian Kata (أَقْسَامُ الْكَلِمَةِ)

Dalam tata bahasa Arab (Qowaid/Nahwu), setiap kata dalam kalimat terbagi menjadi tiga jenis utama:

1. **Isim (الِاسْمُ)**: Kata benda, nama orang, tempat, sifat, atau konsep yang tidak terikat oleh waktu.
   - *Ciri-ciri*: Diawali Alif Lam (الـ), ber-Tanwin (ـٌ ـٍ ـً), diawali huruf jar.
   - *Contoh*: كِتَابٌ (Buku), الْمَسْجِدُ (Masjid), مُحَمَّدٌ (Muhammad).

2. **Fi'il (الْفِعْلُ)**: Kata kerja yang menunjukkan suatu perbuatan dan terikat oleh waktu (lampau, sekarang, atau akan datang).
   - *Ciri-ciri*: Masuknya huruf قَدْ, سَـ, سَوْفَ, atau Ta Tani's Sakinah (تْ).
   - *Contoh*: كَتَبَ (Telah menulis), يَكْتُبُ (Sedang/Akan menulis), اُكْتُبْ (Tulislah!).

3. **Harf (الْحَرْفُ)**: Kata tugas/penghubung yang tidak memiliki makna sempurna kecuali jika digabungkan dengan kata lain.
   - *Contoh*: فِي (Di dalam), عَلَى (Di atas), مِنْ (Dari), إِلَى (Ke).`,
    pdfFileName: 'Modul_Qowaid_Pengenalan_Kata.pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    pdfPageCount: 8,
    authorName: 'Ust. Ahmad Dahlan, M.Pd.',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-07-20T10:30:00Z',
  },
  {
    id: 'mat-qowaid-2',
    title: 'Mubtada\' dan Khabar (Jumlah Ismiyyah)',
    arabicTitle: 'المبتدأ والخبر',
    category: 'qowaid',
    level: 'Menengah',
    description: 'Struktur kalimat nominal dalam Bahasa Arab yang terdiri dari subjek (mubtada\') dan predikat (khabar).',
    content: `### Struktur Kalimat Nominal (الْجُمْلَةُ الإِسْمِيَّةُ)

Jumlah Ismiyyah adalah kalimat yang diawali oleh Isim. Dua rukun utamanya adalah:

- **Mubtada\' (الْمُبْتَدَأُ)**: Isim ma'rifah (tertentu) yang berada di awal kalimat dan berfungsi sebagai subjek.
- **Khabar (الْخَبَرُ)**: Kata/frasa yang menyempurnakan makna Mubtada' dan berfungsi sebagai predikat.

#### Kaidah Penting:
1. Mubtada' dan Khabar harus selaras dalam hal **Gender** (Mudzakkar/Muannats) dan **Jumlah** (Mufrad/Tatsniyah/Jamak).
2. Mubtada' dan Khabar hukum asalnya adalah **Marfu'** (berharakat Dhammah).

#### Contoh Kalimat:
- الطَّالِبُ مُجْتَهِدٌ (*At-Thalibu mujtahidun*) = Siswa itu rajin.
- الطَّالِبَةُ مُجْتَهِدَةٌ (*At-Thalibatu mujtahidatun*) = Siswi itu rajin.`,
    pdfFileName: 'Rangkuman_Mubtada_Khabar.pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    pdfPageCount: 5,
    authorName: 'Ust. Ahmad Dahlan, M.Pd.',
    createdAt: '2026-07-18T09:00:00Z',
    updatedAt: '2026-07-22T11:00:00Z',
  },

  // 2. HIWAR
  {
    id: 'mat-hiwar-1',
    title: 'Perkenalan Diri (At-Ta\'aruf)',
    arabicTitle: 'التَّعَارُفُ',
    category: 'hiwar',
    level: 'Dasar',
    description: 'Percakapan sehari-hari antara dua siswa saat baru pertama kali bertemu di kelas.',
    content: 'Percakapan singkat interaktif antara Ahmad dan Ali mengenai perkenalan nama, asal, dan tempat tinggal.',
    dialogues: [
      { id: 'd1', speaker: 'أَحْمَدُ (Ahmad)', arabic: 'السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ', latin: 'Assalamu\'alaikum warahmatullahi wabarakatuh', translation: 'Semoga keselamatan, rahmat Allah, dan berkah-Nya tercurah untukmu.' },
      { id: 'd2', speaker: 'عَلِيٌّ (Ali)', arabic: 'وَعَلَيْكُمُ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ', latin: 'Wa\'alaikumussalam warahmatullahi wabarakatuh', translation: 'Dan semoga keselamatan, rahmat Allah, dan berkah-Nya tercurah untukmu juga.' },
      { id: 'd3', speaker: 'أَحْمَدُ (Ahmad)', arabic: 'اسْمِي أَحْمَدُ، مَا اسْمُكَ؟', latin: 'Ismii Ahmad, masmuka?', translation: 'Namaku Ahmad, siapa namamu?' },
      { id: 'd4', speaker: 'عَلِيٌّ (Ali)', arabic: 'اسْمِي عَلِيٌّ. كَيْفَ حَالُكَ؟', latin: 'Ismii \'Aliyyun. Kaifa haaluka?', translation: 'Namaku Ali. Bagaimana kabarmu?' },
      { id: 'd5', speaker: 'أَحْمَدُ (Ahmad)', arabic: 'بِخَيْرٍ وَالْحَمْدُ للهِ، وَكَيْفَ حَالُكَ أَنْتَ؟', latin: 'Bikhairin walhamdulillah, wa kaifa haaluka anta?', translation: 'Baik, alhamdulillah. Dan bagaimana kabarmu?' },
      { id: 'd6', speaker: 'عَلِيٌّ (Ali)', arabic: 'بِخَيْرٍ وَالْحَمْدُ للهِ. مِنْ أَيْنَ أَنْتَ؟', latin: 'Bikhairin walhamdulillah. Min aina anta?', translation: 'Baik alhamdulillah. Dari mana asalmu?' },
      { id: 'd7', speaker: 'أَحْمَدُ (Ahmad)', arabic: 'أَنَا مِنْ جَاكَرْتَا، وَأَنْتَ؟', latin: 'Ana min Jakarta, wa anta?', translation: 'Saya dari Jakarta, dan kamu?' },
      { id: 'd8', speaker: 'عَلِيٌّ (Ali)', arabic: 'أَنَا مِنْ سُورَابَايَا. أَهْلًا وَسَهْلًا يَا أَحْمَدُ', latin: 'Ana min Surabaya. Ahlan wa sahlan yaa Ahmad', translation: 'Saya dari Surabaya. Selamat datang wahai Ahmad.' },
    ],
    pdfFileName: 'Teks_Hiwar_Taaruf.pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    pdfPageCount: 3,
    authorName: 'Ustzh. Fatimah, S.Pd.I.',
    createdAt: '2026-07-10T08:00:00Z',
    updatedAt: '2026-07-10T08:00:00Z',
  },

  // 3. KOSAKATA
  {
    id: 'mat-kosakata-1',
    title: 'Peralatan Sekolah (الأَدَوَاتُ الْمَدْرَسِيَّةُ)',
    arabicTitle: 'الأَدَوَاتُ الْمَدْرَسِيَّةُ',
    category: 'kosakata',
    level: 'Dasar',
    description: 'Kumpulan mufradat peralatan sekolah beserta audio pengucapan dan kartu flashcard interaktif.',
    content: 'Kartu flashcard kosakata lengkap peralatan kelas dan perlengkapan belajar siswa.',
    vocabularies: [
      { id: 'v1', word: 'كِتَابٌ', latin: 'Kitaabun', meaning: 'Buku Paket / Buku Bacaan', category: 'Peralatan', exampleArabic: 'هَذَا كِتَابُ اللُّغَةِ الْعَرَبِيَّةِ', exampleTranslation: 'Ini adalah buku Bahasa Arab.' },
      { id: 'v2', word: 'قَلَمٌ', latin: 'Qalamun', meaning: 'Pena / Pulpen', category: 'Peralatan', exampleArabic: 'أَكْتُبُ بِالْقَلَمِ', exampleTranslation: 'Saya menulis dengan pulpen.' },
      { id: 'v3', word: 'مِسْطَرَةٌ', latin: 'Mishtharatun', meaning: 'Penggaris', category: 'Peralatan', exampleArabic: 'الْمِسْطَرَةُ طَوِيلَةٌ', exampleTranslation: 'Penggaris itu panjang.' },
      { id: 'v4', word: 'حَقِيبَةٌ', latin: 'Haqiibatun', meaning: 'Tas Sekolah', category: 'Peralatan', exampleArabic: 'الحَقِيبَةُ جَدِيدَةٌ', exampleTranslation: 'Tas itu baru.' },
      { id: 'v5', word: 'مَكْتَبٌ', latin: 'Maktabun', meaning: 'Meja Belajar', category: 'Ruang Kelas', exampleArabic: 'الْكِتَابُ عَلَى الْمَكْتَبِ', exampleTranslation: 'Buku itu di atas meja.' },
      { id: 'v6', word: 'كُرْسِيٌّ', latin: 'Kursiyyun', meaning: 'Kursi', category: 'Ruang Kelas', exampleArabic: 'أَجْلِسُ عَلَى الْكُرْسِيِّ', exampleTranslation: 'Saya duduk di atas kursi.' },
      { id: 'v7', word: 'سَبُّورَةٌ', latin: 'Sabbuuratun', meaning: 'Papan Tulis', category: 'Ruang Kelas', exampleArabic: 'الْمُدَرِّسُ يَكْتُبُ عَلَى السَّبُّورَةِ', exampleTranslation: 'Guru menulis di papan tulis.' },
    ],
    pdfFileName: 'Daftar_Mufradat_Sekolah.pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    pdfPageCount: 4,
    authorName: 'Ustzh. Fatimah, S.Pd.I.',
    createdAt: '2026-07-12T08:00:00Z',
    updatedAt: '2026-07-15T08:00:00Z',
  },

  // 4. MAHFUDZOT
  {
    id: 'mat-mahfudzot-1',
    title: 'Man Jadda Wajada (Kesungguhan Belajar)',
    arabicTitle: 'مَنْ جَدَّ وَجَدَ',
    category: 'mahfudzot',
    level: 'Dasar',
    description: 'Kata mutiara hikmah tentang pentingnya ikhtiar dan kesungguhan dalam menuntut ilmu.',
    content: 'Mahfudzot populer yang mengajarkan bahwa barangsiapa yang bersungguh-sungguh, maka ia akan meraih cita-citanya.',
    mahfudzot: {
      arabic: 'مَنْ جَدَّ وَجَدَ ، وَمَنْ زَرَعَ حَصَدَ',
      latin: 'Man jadda wajada, wa man zara\'a hashada',
      translation: 'Barangsiapa bersungguh-sungguh maka ia akan berhasil, dan barangsiapa menanam maka ia akan memanen.',
      explanation: 'Pepatah ini menekankan bahwa hasil akhir yang manis adalah buah dari kerja keras dan ketekunan yang konsisten tanpa pantang menyerah.'
    },
    pdfFileName: 'Modul_Mahfudzot_Pilihan.pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    pdfPageCount: 2,
    authorName: 'Ust. Ahmad Dahlan, M.Pd.',
    createdAt: '2026-07-14T08:00:00Z',
    updatedAt: '2026-07-14T08:00:00Z',
  },
  {
    id: 'mat-mahfudzot-2',
    title: 'Keutamaan Waktu (الوقت أثمن من الذهب)',
    arabicTitle: 'الوَقْتُ أَثْمَنُ مِنَ الذَّهَبِ',
    category: 'mahfudzot',
    level: 'Menengah',
    description: 'Kata hikmah tentang pentingnya menghargai setiap detik waktu dalam kehidupan.',
    content: 'Mahfudzot mengenai betapa berharga dan mahalnya kesempatan waktu.',
    mahfudzot: {
      arabic: 'الوَقْتُ أَثْمَنُ مِنَ الذَّهَبِ ، وَإِذَا مَضَى لاَ يَعُودُ',
      latin: 'Al-waqtu atsmanu minad-dzahabi, wa idzaa madhaa laa ya\'uudu',
      translation: 'Waktu itu lebih berharga daripada emas, dan apabila telah berlalu ia tidak akan pernah kembali lagi.',
      explanation: 'Waktu adalah modal berharga yang tidak bisa dibeli kembali dengan uang sebanyak apa pun.'
    },
    pdfFileName: 'Keutamaan_Waktu_Mahfudzot.pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    pdfPageCount: 3,
    authorName: 'Ust. Ahmad Dahlan, M.Pd.',
    createdAt: '2026-07-16T08:00:00Z',
    updatedAt: '2026-07-16T08:00:00Z',
  }
];

export const INITIAL_PENILAIAN: Penilaian[] = [
  {
    id: 'pen-1',
    title: 'Latihan 1: Qowaid Pembagian Kata',
    type: 'latihan',
    category: 'qowaid',
    durationMinutes: 15,
    passingGrade: 70,
    totalPoints: 100,
    createdAt: '2026-07-20T08:00:00Z',
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        questionText: 'Manakah di bawah ini yang merupakan contoh dari kata benda (Isim)?',
        questionArabic: 'أَيُّ كَلِمَةٍ مِمَّا يَلِي تُعْتَبَرُ اسْمًا؟',
        options: ['كَتَبَ', 'الْمَسْجِدُ', 'عَلَى', 'يَكْتُبُ'],
        correctAnswer: 1, // 'الْمَسْجِدُ'
        explanation: 'الْمَسْجِدُ adalah Isim karena diawali dengan Alif Lam (الـ) dan menunjukkan tempat.',
        points: 25,
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        questionText: 'Manakah yang termasuk huruf Jar dalam Bahasa Arab?',
        questionArabic: 'مَا هِيَ حُرُوفُ الْجَرِّ مِمَّا يَلِي؟',
        options: ['فِي وَعَلَى', 'كَتَبَ وَقَرَأَ', 'مُحَمَّدٌ وَعَلِيٌّ', 'يَكْتُبُ وَيَقْرَأُ'],
        correctAnswer: 0,
        explanation: 'فِي (di dalam) dan عَلَى (di atas) adalah bagian dari huruf jar.',
        points: 25,
      },
      {
        id: 'q3',
        type: 'true_false',
        questionText: 'Fi\'il Madhi adalah kata kerja yang menunjukkan waktu sekarang.',
        questionArabic: 'الفِعْلُ المَاضِي يَدُلُّ عَلَى الزَّمَنِ الحَاضِرِ.',
        options: ['Benar (صَحِيحٌ)', 'Salah (خَطَأٌ)'],
        correctAnswer: 1, // Salah
        explanation: 'Fi\'il Madhi menunjukkan waktu LAMPAL (masa lalu). Waktu sekarang ditunjukkan oleh Fi\'il Mudhari\'.',
        points: 25,
      },
      {
        id: 'q4',
        type: 'fill_in_blank',
        questionText: 'Lengkapilah kata yang rumpang: "أَنَا أَكْتُبُ بِـ ... (Pulpen)"',
        questionArabic: 'أَكْتُبُ بِـ ...',
        correctAnswer: 'الْقَلَمِ',
        explanation: 'Pulpen dalam Bahasa Arab adalah الْقَلَمِ.',
        points: 25,
      }
    ]
  },
  {
    id: 'pen-2',
    title: 'Kuis Interaktif: Kosakata & Hiwar Sehari-hari',
    type: 'kuis',
    category: 'kosakata',
    durationMinutes: 10,
    passingGrade: 75,
    totalPoints: 100,
    createdAt: '2026-07-22T09:00:00Z',
    questions: [
      {
        id: 'q2-1',
        type: 'multiple_choice',
        questionText: 'Apakah arti dari kosakata "حَقِيبَةٌ"?',
        questionArabic: 'مَا مَعْنَى كَلِمَةِ "حَقِيبَةٌ"؟',
        options: ['Buku Tulis', 'Penggaris', 'Tas Sekolah', 'Papan Tulis'],
        correctAnswer: 2,
        explanation: 'حَقِيبَةٌ berarti Tas Sekolah.',
        points: 33,
      },
      {
        id: 'q2-2',
        type: 'multiple_choice',
        questionText: 'Jawaban yang tepat untuk salam "كَيْفَ حَالُكَ؟" adalah...',
        questionArabic: 'الْجَوَابُ الْمُنَاسِبُ لِـ "كَيْفَ حَالُكَ؟"',
        options: ['أَهْلًا وَسَهْلًا', 'بِخَيْرٍ وَالْحَمْدُ للهِ', 'مَعَ السَّلاَمَةِ', 'اسْمِي أَحْمَدُ'],
        correctAnswer: 1,
        explanation: 'Menanyakan kabar dijawab dengan "بِخَيْرٍ وَالْحَمْدُ للهِ" (Baik, alhamdulillah).',
        points: 33,
      },
      {
        id: 'q2-3',
        type: 'multiple_choice',
        questionText: 'Lanjutkan pepatah Mahfudzot berikut: "مَنْ جَدَّ ..."',
        questionArabic: 'أَكْمِلِ المَحْفُوظَاتِ: مَنْ جَدَّ ...',
        options: ['صَبَرَ', 'حَصَدَ', 'وَجَدَ', 'نَجَحَ'],
        correctAnswer: 2,
        explanation: 'Kelanjutan dari "مَنْ جَدَّ" adalah "وَجَدَ" (Barangsiapa bersungguh-sungguh ia akan berhasil).',
        points: 34,
      }
    ]
  },
  {
    id: 'pen-3',
    title: 'Ujian Akhir Semester Bahasa Arab',
    type: 'ujian',
    category: 'umum',
    durationMinutes: 30,
    passingGrade: 80,
    totalPoints: 100,
    createdAt: '2026-07-25T10:00:00Z',
    questions: [
      {
        id: 'u1',
        type: 'multiple_choice',
        questionText: 'Tentukan kedudukan kata "الطَّالِبُ" dalam kalimat "الطَّالِبُ مُجْتَهِدٌ":',
        questionArabic: 'مَا إِعْرَابُ كَلِمَةِ "الطَّالِبُ" فِي "الطَّالِبُ مُجْتَهِدٌ"؟',
        options: ['Khabar', 'Mubtada\'', 'Fi\'il', 'Harf Jar'],
        correctAnswer: 1,
        explanation: 'Kata "الطَّالِبُ" berada di awal kalimat nominal sehingga berkedudukan sebagai Mubtada\' (Subjek).',
        points: 25,
      },
      {
        id: 'u2',
        type: 'multiple_choice',
        questionText: 'Manakah susunan kata berikut yang bermakna "Papan Tulis itu besar"?',
        questionArabic: 'اخْتَرِ الجُمْلَةَ الصَّحِيحَةَ:',
        options: [
          'السَّبُّورَةُ كَبِيرَةٌ',
          'السَّبُّورَةُ كَبِيرٌ',
          'الكِتَابُ كَبِيرَةٌ',
          'المَكْتَبُ كَبِيرَةٌ'
        ],
        correctAnswer: 0,
        explanation: 'السَّبُّورَةُ adalah kata muannats (feminin) sehingga khabar-nya juga harus muannats: كَبِيرَةٌ.',
        points: 25,
      },
      {
        id: 'u3',
        type: 'multiple_choice',
        questionText: 'Bahasa Arab dari kata "Penggaris" adalah...',
        questionArabic: 'مَا المَعْنَى العَرَبِيُّ لِـ "Penggaris"؟',
        options: ['قَلَمٌ', 'مِسْطَرَةٌ', 'مَكْتَبٌ', 'كُرْسِيٌّ'],
        correctAnswer: 1,
        explanation: 'مِسْطَرَةٌ berarti Penggaris.',
        points: 25,
      },
      {
        id: 'u4',
        type: 'true_false',
        questionText: 'Kata "الوَقْتُ أَثْمَنُ مِنَ الذَّهَبِ" bermakna "Emas lebih mahal daripada waktu".',
        questionArabic: 'الوَقْتُ أَثْمَنُ مِنَ الذَّهَبِ',
        options: ['Benar (صَحِيحٌ)', 'Salah (خَطَأٌ)'],
        correctAnswer: 1,
        explanation: 'Salah, kalimat tersebut bermakna "WAKTU lebih berharga daripada EMAS".',
        points: 25,
      }
    ]
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'Muhammad Farhan',
    nisn: '20261001',
    email: 'farhan@siswa.belajar.id',
    className: 'Kelas X Bahasa',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    totalXP: 450,
    completedMaterials: ['mat-qowaid-1', 'mat-hiwar-1', 'mat-kosakata-1'],
    attempts: [
      {
        id: 'att-1',
        penilaianId: 'pen-1',
        penilaianTitle: 'Latihan 1: Qowaid Pembagian Kata',
        penilaianType: 'latihan',
        studentId: 'std-1',
        studentName: 'Muhammad Farhan',
        score: 100,
        passed: true,
        answers: { 'q1': 1, 'q2': 0, 'q3': 1, 'q4': 'الْقَلَمِ' },
        timeSpentSeconds: 420,
        completedAt: '2026-07-21T10:15:00Z',
      },
      {
        id: 'att-2',
        penilaianId: 'pen-2',
        penilaianTitle: 'Kuis Interaktif: Kosakata & Hiwar Sehari-hari',
        penilaianType: 'kuis',
        studentId: 'std-1',
        studentName: 'Muhammad Farhan',
        score: 100,
        passed: true,
        answers: { 'q2-1': 2, 'q2-2': 1, 'q2-3': 2 },
        timeSpentSeconds: 280,
        completedAt: '2026-07-23T11:20:00Z',
      }
    ],
    status: 'aktif',
    lastActive: '2026-07-31T06:00:00Z',
  },
  {
    id: 'std-2',
    name: 'Aisyah Az-Zahra',
    nisn: '20261002',
    email: 'aisyah@siswa.belajar.id',
    className: 'Kelas X Bahasa',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    totalXP: 520,
    completedMaterials: ['mat-qowaid-1', 'mat-qowaid-2', 'mat-hiwar-1', 'mat-mahfudzot-1'],
    attempts: [
      {
        id: 'att-3',
        penilaianId: 'pen-1',
        penilaianTitle: 'Latihan 1: Qowaid Pembagian Kata',
        penilaianType: 'latihan',
        studentId: 'std-2',
        studentName: 'Aisyah Az-Zahra',
        score: 100,
        passed: true,
        answers: { 'q1': 1, 'q2': 0, 'q3': 1, 'q4': 'الْقَلَمِ' },
        timeSpentSeconds: 310,
        completedAt: '2026-07-21T14:00:00Z',
      },
      {
        id: 'att-4',
        penilaianId: 'pen-3',
        penilaianTitle: 'Ujian Akhir Semester Bahasa Arab',
        penilaianType: 'ujian',
        studentId: 'std-2',
        studentName: 'Aisyah Az-Zahra',
        score: 100,
        passed: true,
        answers: { 'u1': 1, 'u2': 0, 'u3': 1, 'u4': 1 },
        timeSpentSeconds: 980,
        completedAt: '2026-07-26T09:00:00Z',
      }
    ],
    status: 'aktif',
    lastActive: '2026-07-30T16:30:00Z',
  },
  {
    id: 'std-3',
    name: 'Rizky Ramadhan',
    nisn: '20261003',
    email: 'rizky@siswa.belajar.id',
    className: 'Kelas X IPA 1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    totalXP: 280,
    completedMaterials: ['mat-qowaid-1', 'mat-kosakata-1'],
    attempts: [
      {
        id: 'att-5',
        penilaianId: 'pen-1',
        penilaianTitle: 'Latihan 1: Qowaid Pembagian Kata',
        penilaianType: 'latihan',
        studentId: 'std-3',
        studentName: 'Rizky Ramadhan',
        score: 75,
        passed: true,
        answers: { 'q1': 1, 'q2': 0, 'q3': 0, 'q4': 'الْقَلَمِ' },
        timeSpentSeconds: 510,
        completedAt: '2026-07-22T08:30:00Z',
      }
    ],
    status: 'aktif',
    lastActive: '2026-07-29T10:00:00Z',
  },
  {
    id: 'std-4',
    name: 'Siti Maryam',
    nisn: '20261004',
    email: 'maryam@siswa.belajar.id',
    className: 'Kelas X IPA 1',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    totalXP: 360,
    completedMaterials: ['mat-qowaid-1', 'mat-hiwar-1', 'mat-mahfudzot-1'],
    attempts: [
      {
        id: 'att-6',
        penilaianId: 'pen-2',
        penilaianTitle: 'Kuis Interaktif: Kosakata & Hiwar Sehari-hari',
        penilaianType: 'kuis',
        studentId: 'std-4',
        studentName: 'Siti Maryam',
        score: 100,
        passed: true,
        answers: { 'q2-1': 2, 'q2-2': 1, 'q2-3': 2 },
        timeSpentSeconds: 240,
        completedAt: '2026-07-24T13:45:00Z',
      }
    ],
    status: 'aktif',
    lastActive: '2026-07-28T15:20:00Z',
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    userName: 'Ust. Ahmad Dahlan, M.Pd.',
    userRole: 'guru',
    action: 'Unggah Materi PDF',
    details: 'Menambahkan modul Qowaid baru: Pengenalan Isim, Fi\'il, dan Harf',
    timestamp: '2026-07-15T08:05:00Z',
  },
  {
    id: 'log-2',
    userName: 'Ust. Ahmad Dahlan, M.Pd.',
    userRole: 'guru',
    action: 'Membuat Kuis Baru',
    details: 'Menerbitkan Kuis Interaktif: Kosakata & Hiwar Sehari-hari',
    timestamp: '2026-07-22T09:00:00Z',
  },
  {
    id: 'log-3',
    userName: 'Aisyah Az-Zahra',
    userRole: 'siswa',
    action: 'Menyelesaikan Ujian',
    details: 'Meraih nilai 100 pada Ujian Akhir Semester Bahasa Arab',
    timestamp: '2026-07-26T09:00:00Z',
  }
];
