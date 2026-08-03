import { Materi, Penilaian, Student, ActivityLog, ForumPost } from '../types';
import { createMahfudzotMateriList } from './mahfudzotData';

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
    qowaidCategory: 'قواعد Dasar',
    babNumber: 1,
    learningTargets: [
      'Mampu membedakan antara Isim, Fi\'il, dan Harf dalam kalimat Bahasa Arab',
      'Mengenali ciri-ciri khas Isim (Tanwin, Alif Lam, Huruf Jar)',
      'Mengetahui ciri-ciri khas Fi\'il dan pembagian berdasarkan waktu',
      'Dapat mengidentifikasi Harf dan menggunakannya dalam frasa sederhana'
    ],
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
    qowaidCategory: 'قواعد Menengah',
    babNumber: 2,
    learningTargets: [
      'Memahami definisi dan struktur Jumlah Ismiyyah (Mubtada\' dan Khabar)',
      'Mampu menyelaraskan gender (Mudzakkar/Muannats) antara Mubtada\' dan Khabar',
      'Mengenali hukum I\'rab Marfu\' (Dhammah) pada Mubtada\' dan Khabar',
      'Mampu membuat kalimat nominal sederhana dengan tepat'
    ],
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

  // 3. KOSAKATA (BAB 1, BAB 2, BAB 3)
  {
    id: 'mat-kosakata-1',
    title: 'Peralatan Sekolah (الأَدَوَاتُ الْمَدْرَسِيَّةُ)',
    arabicTitle: 'الأَدَوَاتُ الْمَدْرَسِيَّةُ',
    category: 'kosakata',
    vocabCategory: 'اسْم',
    babNumber: 1,
    level: 'Dasar',
    description: 'Kumpulan mufradat Isim (Kata Benda) peralatan sekolah beserta audio pengucapan dan kartu flashcard interaktif.',
    content: 'Kartu flashcard kosakata lengkap peralatan kelas dan perlengkapan belajar siswa.',
    vocabularies: [
      { id: 'v1', word: 'كِتَابٌ', latin: 'Kitaabun', meaning: 'Buku Paket / Buku Bacaan', category: 'اسْم', exampleArabic: 'هَذَا كِتَابُ اللُّغَةِ الْعَرَبِيَّةِ', exampleTranslation: 'Ini adalah buku Bahasa Arab.' },
      { id: 'v2', word: 'قَلَمٌ', latin: 'Qalamun', meaning: 'Pena / Pulpen', category: 'اسْم', exampleArabic: 'أَكْتُبُ بِالْقَلَمِ', exampleTranslation: 'Saya menulis dengan pulpen.' },
      { id: 'v3', word: 'مِسْطَرَةٌ', latin: 'Mishtharatun', meaning: 'Penggaris', category: 'اسْم', exampleArabic: 'الْمِسْطَرَةُ طَوِيلَةٌ', exampleTranslation: 'Penggaris itu panjang.' },
      { id: 'v4', word: 'حَقِيبَةٌ', latin: 'Haqiibatun', meaning: 'Tas Sekolah', category: 'اسْم', exampleArabic: 'الحَقِيبَةُ جَدِيدَةٌ', exampleTranslation: 'Tas itu baru.' },
      { id: 'v5', word: 'مَكْتَبٌ', latin: 'Maktabun', meaning: 'Meja Belajar', category: 'اسْم', exampleArabic: 'الْكِتَابُ عَلَى الْمَكْتَبِ', exampleTranslation: 'Buku itu di atas meja.' },
      { id: 'v6', word: 'كُرْسِيٌّ', latin: 'Kursiyyun', meaning: 'Kursi', category: 'اسْم', exampleArabic: 'أَجْلِسُ عَلَى الْكُرْسِيِّ', exampleTranslation: 'Saya duduk di atas kursi.' },
      { id: 'v7', word: 'سَبُّورَةٌ', latin: 'Sabbuuratun', meaning: 'Papan Tulis', category: 'اسْم', exampleArabic: 'الْمُدَرِّسُ يَكْتُبُ عَلَى السَّبُّورَةِ', exampleTranslation: 'Guru menulis di papan tulis.' },
    ],
    pdfFileName: 'Daftar_Mufradat_Sekolah.pdf',
    pdfUrl: SAMPLE_PDF_BASE64,
    pdfPageCount: 4,
    authorName: 'Ustzh. Fatimah, S.Pd.I.',
    createdAt: '2026-07-12T08:00:00Z',
    updatedAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'mat-kosakata-2',
    title: 'Kata Kerja Sehari-hari (الأَفْعَالُ الْيَوْمِيَّةُ)',
    arabicTitle: 'الأَفْعَالُ الْيَوْمِيَّةُ',
    category: 'kosakata',
    vocabCategory: 'فِعل',
    babNumber: 2,
    level: 'Dasar',
    description: 'Kumpulan mufradat Fi\'il (Kata Kerja) kegiatan harian di sekolah dan rumah.',
    content: 'Daftar kosakata kata kerja penting bagi siswa.',
    vocabularies: [
      { id: 'v2-1', word: 'قَرَأَ', latin: 'Qara-a', meaning: 'Membaca', category: 'فِعل', exampleArabic: 'قَرَأَ أَحْمَدُ الْكِتَابَ', exampleTranslation: 'Ahmad telah membaca buku.' },
      { id: 'v2-2', word: 'كَتَبَ', latin: 'Kataba', meaning: 'Menulis', category: 'فِعل', exampleArabic: 'كَتَبَ الطَّالِبُ الدَّرْسَ', exampleTranslation: 'Siswa itu menulis pelajaran.' },
      { id: 'v2-3', word: 'أَكَلَ', latin: 'Akala', meaning: 'Makan', category: 'فِعل', exampleArabic: 'أَكَلَ الرُّزَّ فِي الْمَطْعَمِ', exampleTranslation: 'Dia makan nasi di kantin.' },
      { id: 'v2-4', word: 'شَرِبَ', latin: 'Syariba', meaning: 'Minum', category: 'فِعل', exampleArabic: 'شَرِبَ الْمَاءَ الْبَارِدَ', exampleTranslation: 'Dia minum air dingin.' },
      { id: 'v2-5', word: 'ذَهَبَ', latin: 'Zhahaba', meaning: 'Pergi', category: 'فِعل', exampleArabic: 'ذَهَبَ إِلَى الْمَدْرَسَةِ', exampleTranslation: 'Dia pergi ke sekolah.' },
      { id: 'v2-6', word: 'رَجَعَ', latin: 'Raja\'a', meaning: 'Pulang / Kembali', category: 'فِعل', exampleArabic: 'رَجَعَ مِنَ الْمَسْجِدِ', exampleTranslation: 'Dia pulang dari masjid.' },
      { id: 'v2-7', word: 'جَلَسَ', latin: 'Jalasa', meaning: 'Duduk', category: 'فِعل', exampleArabic: 'جَلَسَ عَلَى الْكُرْسِيِّ', exampleTranslation: 'Dia duduk di atas kursi.' },
    ],
    authorName: 'Ust. Ahmad Dahlan, M.Pd.',
    createdAt: '2026-07-14T08:00:00Z',
    updatedAt: '2026-07-16T08:00:00Z',
  },
  {
    id: 'mat-kosakata-3',
    title: 'Kata Sambung & Huruf Jar (الْحُرُوفُ وَالأَدَوَاتُ)',
    arabicTitle: 'الْحُرُوفُ وَالأَدَوَاتُ',
    category: 'kosakata',
    vocabCategory: 'حَرْف',
    babNumber: 3,
    level: 'Dasar',
    description: 'Kumpulan mufradat Harf (Kata Sambung & Kata Tugas).',
    content: 'Huruf jar dan kata penghubung kalimat.',
    vocabularies: [
      { id: 'v3-1', word: 'فِي', latin: 'Fii', meaning: 'Di dalam', category: 'حَرْف' },
      { id: 'v3-2', word: 'عَلَى', latin: '‘Alaa', meaning: 'Di atas', category: 'حَرْف' },
      { id: 'v3-3', word: 'إِلَى', latin: 'Ilaa', meaning: 'Ke / Kepada', category: 'حَرْف' },
      { id: 'v3-4', word: 'مِنْ', latin: 'Min', meaning: 'Dari', category: 'حَرْف' },
      { id: 'v3-5', word: 'مَعَ', latin: 'Ma\'a', meaning: 'Bersama', category: 'حَرْف' },
      { id: 'v3-6', word: 'ثُمَّ', latin: 'Thumma', meaning: 'Kemudian', category: 'حَرْف' },
    ],
    authorName: 'Ust. Ahmad Dahlan, M.Pd.',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-07-18T08:00:00Z',
  },

  // 4. MAHFUDZOT LENGKAP (1 - 87 KELAS 1 SAMPAI KELAS 5)
  ...createMahfudzotMateriList()
];

export const INITIAL_PENILAIAN: Penilaian[] = [];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'Muhammad Farhan',
    nisn: '20261001',
    email: 'farhan@siswa.belajar.id',
    gender: 'Laki-laki',
    tingkat: 'Menengah Akhir',
    schoolName: 'MA Negeri 1 Jakarta',
    className: 'Kelas 10',
    rombelName: '10 Bahasa',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    totalXP: 250,
    completedMaterials: ['mat-qowaid-1', 'mat-hiwar-1', 'mat-kosakata-1'],
    attempts: [],
    status: 'aktif',
    lastActive: '2026-07-31T06:00:00Z',
  },
  {
    id: 'std-2',
    name: 'Aisyah Az-Zahra',
    nisn: '20261002',
    email: 'aisyah@siswa.belajar.id',
    gender: 'Perempuan',
    tingkat: 'Menengah Akhir',
    schoolName: 'MA Negeri 1 Jakarta',
    className: 'Kelas 10',
    rombelName: '10 Bahasa',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    totalXP: 320,
    completedMaterials: ['mat-qowaid-1', 'mat-qowaid-2', 'mat-hiwar-1', 'mat-mahfudzot-1'],
    attempts: [],
    status: 'aktif',
    lastActive: '2026-07-30T16:30:00Z',
  },
  {
    id: 'std-3',
    name: 'Rizky Ramadhan',
    nisn: '20261003',
    email: 'rizky@siswa.belajar.id',
    gender: 'Laki-laki',
    tingkat: 'Menengah Pertama',
    schoolName: 'SMPIT Abu Bakar',
    className: 'Kelas 8',
    rombelName: '8 Abu Bakar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    totalXP: 180,
    completedMaterials: ['mat-qowaid-1', 'mat-kosakata-1'],
    attempts: [],
    status: 'aktif',
    lastActive: '2026-07-29T10:00:00Z',
  },
  {
    id: 'std-4',
    name: 'Siti Maryam',
    nisn: '20261004',
    email: 'maryam@siswa.belajar.id',
    gender: 'Perempuan',
    tingkat: 'Menengah Pertama',
    schoolName: 'SMPIT Abu Bakar',
    className: 'Kelas 8',
    rombelName: '8 Abu Bakar',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    totalXP: 260,
    completedMaterials: ['mat-qowaid-1', 'mat-hiwar-1', 'mat-mahfudzot-1'],
    attempts: [],
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

export const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'forum-1',
    title: 'Bagaimana cara membedakan Isim dan Fi\'il jika tidak ada Alif Lam?',
    content: 'Ustaz, mohon penjelasannya. Jika sebuah kata tidak diawali dengan الـ (Alif Lam), bagaimana cara praktis membedakan apakah kata tersebut Isim atau Fi\'il saat membaca kitab gundul?',
    materiId: 'mat-qowaid-1',
    materiTitle: 'Pengenalan Isim, Fi\'il, dan Harf',
    category: 'qowaid',
    authorId: 'std-1',
    authorName: 'Muhammad Farhan',
    authorRole: 'siswa',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-07-28T10:00:00Z',
    updatedAt: '2026-07-28T10:00:00Z',
    isPinned: true,
    status: 'terjawab',
    likes: 4,
    likedBy: ['std-2', 'std-3', 'std-4'],
    replies: [
      {
        id: 'reply-1',
        authorId: 'guru-1',
        authorName: 'Ust. Ahmad Dahlan, M.Pd.',
        authorRole: 'guru',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        content: 'Pertanyaan bagus sekali Ananda Farhan! Jika tidak ada Alif Lam, kita bisa melihat ciri lain:\n1. Tanwin (ـٌ ـٍ ـً): Hanya ada pada Isim.\n2. Coba masukkan Harf Jar (seperti فِي / مِنْ): Jika cocok dipadukan, maka itu Isim.\n3. Jika kata tersebut dapat dimasuki huruf قَدْ atau سَوْفَ, maka itu pasti Fi\'il.',
        createdAt: '2026-07-28T11:15:00Z',
        likes: 5,
        likedBy: ['std-1', 'std-2', 'std-3', 'std-4'],
        isVerifiedAnswer: true,
      },
      {
        id: 'reply-2',
        authorId: 'std-2',
        authorName: 'Aisyah Az-Zahra',
        authorRole: 'siswa',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        content: 'Syukran Ustadz atas penjelasannya! Sangat membantu dalam memahami materi bab 1.',
        createdAt: '2026-07-28T12:00:00Z',
        likes: 2,
        likedBy: ['std-1'],
        isVerifiedAnswer: false,
      }
    ]
  },
  {
    id: 'forum-2',
    title: 'Tips Menghafal Percakapan At-Ta\'aruf agar tidak cepat lupa',
    content: 'Teman-teman dan Ustadzah, adakah tips atau metode efektif untuk mempraktikkan Hiwar At-Ta\'aruf dengan lancar bersama pasangan belajar?',
    materiId: 'mat-hiwar-1',
    materiTitle: 'Perkenalan Diri (At-Ta\'aruf)',
    category: 'hiwar',
    authorId: 'std-2',
    authorName: 'Aisyah Az-Zahra',
    authorRole: 'siswa',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-07-29T14:30:00Z',
    updatedAt: '2026-07-29T14:30:00Z',
    isPinned: false,
    status: 'terbuka',
    likes: 3,
    likedBy: ['std-1', 'std-4'],
    replies: [
      {
        id: 'reply-3',
        authorId: 'guru-2',
        authorName: 'Ustzh. Fatimah, S.Pd.I.',
        authorRole: 'guru',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        content: 'Afwan Mbak Aisyah, cara terbaik adalah merekam suara sendiri saat mempraktikkan dialogue pair, lalu dengarkan kembali sambil menyimak teks Hiwar di aplikasi.',
        createdAt: '2026-07-29T16:00:00Z',
        likes: 3,
        likedBy: ['std-2', 'std-1'],
        isVerifiedAnswer: true,
      }
    ]
  }
];

