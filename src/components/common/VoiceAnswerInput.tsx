import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, Globe, Sparkles, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface VoiceAnswerInputProps {
  onTranscript: (text: string) => void;
  onOptionSelect?: (optionIndex: number) => void;
  options?: string[];
  currentValue?: string;
  placeholder?: string;
  questionArabic?: string;
  questionText?: string;
  defaultLanguage?: 'ar-SA' | 'id-ID';
  mode?: 'essay' | 'multiple_choice';
}

export const VoiceAnswerInput: React.FC<VoiceAnswerInputProps> = ({
  onTranscript,
  onOptionSelect,
  options = [],
  currentValue = '',
  placeholder = 'Bicara sekarang atau tulis jawaban...',
  questionArabic,
  questionText,
  defaultLanguage = 'ar-SA',
  mode = 'essay',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<'ar-SA' | 'id-ID'>(defaultLanguage);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [matchFoundNotice, setMatchFoundNotice] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Check Web Speech API Support
  const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const handleStartListening = () => {
    setErrorMessage(null);
    setMatchFoundNotice(null);

    if (!isSpeechSupported) {
      setErrorMessage('Web Speech API tidak didukung di peramban ini. Gunakan Google Chrome, Microsoft Edge, atau Safari.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = speechLang;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimText('');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalResultText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const transcriptStr = res[0].transcript;
          if (res.isFinal) {
            finalResultText += transcriptStr;
          } else {
            currentInterim += transcriptStr;
          }
        }

        if (currentInterim) {
          setInterimText(currentInterim);
        }

        if (finalResultText) {
          const cleanFinal = finalResultText.trim();
          setTranscript(cleanFinal);
          onTranscript(cleanFinal);

          // If mode is multiple choice or options exist, attempt to match option
          if (options && options.length > 0 && onOptionSelect) {
            matchOptionWithSpeech(cleanFinal, options);
          }
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'no-speech') {
          setErrorMessage('Tidak ada suara terdeteksi. Silakan coba bicara lagi.');
        } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Izin mikrofon ditolak. Izinkan akses mikrofon di browser.');
        } else {
          setErrorMessage(`Gagal mendengarkan suara: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setErrorMessage('Gagal memulai perekam suara: ' + err.message);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  };

  // Helper to match spoken answer with Multiple Choice options
  const matchOptionWithSpeech = (speechText: string, opts: string[]) => {
    const normSpeech = speechText.toLowerCase().replace(/[\u064B-\u065F\u0670]/g, '').trim();

    // 1. Check for spoken choice indicators (e.g. "pilihan A", "opsi B", "A", "B", "C", "D")
    const letterMatches: Record<string, number> = {
      'a': 0, 'pilihan a': 0, 'opsi a': 0, 'jawaban a': 0, 'nomor a': 0, 'أ': 0,
      'b': 1, 'pilihan b': 1, 'opsi b': 1, 'jawaban b': 1, 'nomor b': 1, 'ب': 1,
      'c': 2, 'pilihan c': 2, 'opsi c': 2, 'jawaban c': 2, 'nomor c': 2, 'ج': 2,
      'd': 3, 'pilihan d': 3, 'opsi d': 3, 'jawaban d': 3, 'nomor d': 3, 'د': 3,
    };

    if (letterMatches[normSpeech] !== undefined && letterMatches[normSpeech] < opts.length) {
      const idx = letterMatches[normSpeech];
      onOptionSelect!(idx);
      setMatchFoundNotice(`Terdeteksi pilihan Opsi ${String.fromCharCode(65 + idx)} (${opts[idx]})`);
      return;
    }

    // 2. Check direct or partial match with option content strings
    let bestIdx = -1;
    let highestSim = 0;

    opts.forEach((optText, idx) => {
      const normOpt = optText.toLowerCase().replace(/[\u064B-\u065F\u0670]/g, '').trim();
      if (normOpt === normSpeech) {
        bestIdx = idx;
        highestSim = 100;
      } else if (normSpeech.includes(normOpt) || normOpt.includes(normSpeech)) {
        if (highestSim < 80) {
          bestIdx = idx;
          highestSim = 80;
        }
      }
    });

    if (bestIdx !== -1 && onOptionSelect) {
      onOptionSelect(bestIdx);
      setMatchFoundNotice(`Terpilih otomatis: Opsi ${String.fromCharCode(65 + bestIdx)} (${opts[bestIdx]})`);
    }
  };

  // Text-To-Speech (TTS) for Question Pronunciation
  const handleReadQuestion = () => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const textToRead = questionArabic || questionText || '';
    if (!textToRead) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = questionArabic ? 'ar-SA' : 'id-ID';
    utterance.rate = 0.85; // slightly slower for educational clarity

    utterance.onstart = () => setIsSpeakingQuestion(true);
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
      {/* Header & Language Select */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-purple-100 text-purple-800 rounded-lg">
            <Mic size={16} />
          </span>
          <div>
            <span className="text-xs font-extrabold text-slate-800 block">
              Input Suara (Web Speech API)
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Bicara untuk menjawab kuis kosakata / hiwar
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Read Question Audio Button */}
          {(questionArabic || questionText) && 'speechSynthesis' in window && (
            <button
              type="button"
              onClick={handleReadQuestion}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                isSpeakingQuestion
                  ? 'bg-purple-600 text-white border-purple-600 animate-pulse'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title="Dengarkan Pengucapan Soal"
            >
              <Volume2 size={13} />
              <span className="text-[11px]">{isSpeakingQuestion ? 'Memutar...' : 'Dengar Soal'}</span>
            </button>
          )}

          {/* Language Toggle */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setSpeechLang('ar-SA')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                speechLang === 'ar-SA'
                  ? 'bg-purple-700 text-white shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇸🇦 Arab
            </button>
            <button
              type="button"
              onClick={() => setSpeechLang('id-ID')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                speechLang === 'id-ID'
                  ? 'bg-purple-700 text-white shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇮🇩 Indo
            </button>
          </div>
        </div>
      </div>

      {/* Mic Controls & Live Transcript display */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {!isListening ? (
            <button
              type="button"
              onClick={handleStartListening}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Mic size={16} className="animate-pulse" />
              <span>Mulai Bicara ({speechLang === 'ar-SA' ? 'Bahasa Arab' : 'Bahasa Indonesia'})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopListening}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer animate-pulse"
            >
              <MicOff size={16} />
              <span>Hentikan Rekaman</span>
            </button>
          )}

          {isListening && (
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900 bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>Mendengarkan... Silakan ucapkan jawaban Anda</span>
            </div>
          )}
        </div>

        {/* Interim / Final Transcript box */}
        {(interimText || transcript) && (
          <div className="p-2.5 bg-white border border-purple-200 rounded-xl text-xs space-y-1">
            <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">
              Teks Terdeteksi Suara:
            </span>
            <p className={`font-medium ${speechLang === 'ar-SA' ? 'font-arabic text-base dir-rtl text-purple-950' : 'text-slate-800'}`}>
              {interimText ? (
                <span className="text-slate-400 italic">{interimText}...</span>
              ) : (
                <span>{transcript}</span>
              )}
            </p>
          </div>
        )}

        {/* Notice if option matched */}
        {matchFoundNotice && (
          <div className="p-2 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Check size={15} className="text-emerald-600 shrink-0" />
            <span>{matchFoundNotice}</span>
          </div>
        )}

        {/* Error message display */}
        {errorMessage && (
          <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-1.5">
            <AlertCircle size={15} className="text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
