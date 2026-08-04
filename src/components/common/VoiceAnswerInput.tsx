import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, Globe, Sparkles, Check, AlertCircle, RefreshCw, Award, Trophy, Edit3, Keyboard, Info } from 'lucide-react';
import { evaluatePronunciationScore, normalizeArabicSpeechText, PronunciationEvaluation } from '../../utils/pronunciationEvaluator';

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
  placeholder = 'Bicara sekarang atau ketik jawaban...',
  questionArabic,
  questionText,
  defaultLanguage = 'ar-SA',
  mode = 'essay',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<'ar-SA' | 'id-ID'>(defaultLanguage);
  const [transcript, setTranscript] = useState(currentValue || '');
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [matchFoundNotice, setMatchFoundNotice] = useState<string | null>(null);
  const [pronunciationEval, setPronunciationEval] = useState<PronunciationEvaluation | null>(null);
  const [isPermissionRequesting, setIsPermissionRequesting] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Check Web Speech API Support
  const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Sync transcript state and reset evaluation when question or currentValue prop changes
  useEffect(() => {
    setTranscript(currentValue || '');
    setInterimText('');
    setErrorMessage(null);
    setMatchFoundNotice(null);

    if (currentValue && currentValue.trim()) {
      const targetAnswer = questionArabic || questionText || (options && options.length > 0 ? options[0] : '');
      const evalRes = evaluatePronunciationScore(currentValue, targetAnswer);
      setPronunciationEval(evalRes);
    } else {
      setPronunciationEval(null);
    }
  }, [currentValue, questionArabic, questionText]);

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

  const handleStartListening = async () => {
    setErrorMessage(null);
    setMatchFoundNotice(null);

    if (!isSpeechSupported) {
      setErrorMessage('Web Speech API tidak didukung natively di browser ini. Gunakan Chrome/Edge, atau gunakan kolom ketik manual di bawah.');
      return;
    }

    // Request microphone permission explicitly via getUserMedia first (especially for mobile browsers)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setIsPermissionRequesting(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop stream tracks immediately after permission granted
        stream.getTracks().forEach(track => track.stop());
        setIsPermissionRequesting(false);
      }
    } catch (permErr: any) {
      setIsPermissionRequesting(false);
      if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
        setErrorMessage('Izin mikrofon ditolak atau diblokir. Izinkan akses mikrofon di ikon gembok/pengaturan browser Anda, atau ketik jawaban di bawah.');
        return;
      }
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

          // Evaluate pronunciation accuracy score against question text/arabic or expected option
          const targetAnswer = questionArabic || questionText || (options && options.length > 0 ? options[0] : '');
          const evalRes = evaluatePronunciationScore(cleanFinal, targetAnswer);
          setPronunciationEval(evalRes);

          // If mode is multiple choice or options exist, attempt to match option
          if (options && options.length > 0 && onOptionSelect) {
            matchOptionWithSpeech(cleanFinal, options);
          }
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        const err = event.error;
        if (err === 'no-speech') {
          setErrorMessage('Suara tidak terdeteksi. Dekatkan mikrofon HP dan bicara lebih jelas.');
        } else if (err === 'not-allowed' || err === 'service-not-allowed') {
          setErrorMessage('Izin mikrofon ditolak/diblokir oleh browser mobile ini. Izinkan mikrofon di pengaturan browser.');
        } else if (err === 'audio-capture') {
          setErrorMessage('Mikrofon tidak ditemukan pada perangkat ini.');
        } else if (err === 'network') {
          setErrorMessage('Memerlukan koneksi jaringan internet untuk pengenalan suara.');
        } else {
          setErrorMessage(`Terjadi kendala perekaman suara (${err}). Gunakan ketik manual di bawah.`);
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

  const handleTextChange = (val: string) => {
    setTranscript(val);
    onTranscript(val);

    const targetAnswer = questionArabic || questionText || (options && options.length > 0 ? options[0] : '');
    if (val.trim()) {
      const evalRes = evaluatePronunciationScore(val, targetAnswer);
      setPronunciationEval(evalRes);
    } else {
      setPronunciationEval(null);
    }
  };

  // Helper to match spoken answer with Multiple Choice options
  const matchOptionWithSpeech = (speechText: string, opts: string[]) => {
    const rawNormSpeech = speechText.toLowerCase().trim();
    const normSpeechArabic = normalizeArabicSpeechText(speechText);

    // 1. Check for spoken choice indicators (e.g. "pilihan A", "opsi B", "A", "B", "C", "D")
    const letterMatches: Record<string, number> = {
      'a': 0, 'pilihan a': 0, 'opsi a': 0, 'jawaban a': 0, 'nomor a': 0, 'أ': 0,
      'b': 1, 'pilihan b': 1, 'opsi b': 1, 'jawaban b': 1, 'nomor b': 1, 'ب': 1,
      'c': 2, 'pilihan c': 2, 'opsi c': 2, 'jawaban c': 2, 'nomor c': 2, 'ج': 2,
      'd': 3, 'pilihan d': 3, 'opsi d': 3, 'jawaban d': 3, 'nomor d': 3, 'د': 3,
    };

    if (letterMatches[rawNormSpeech] !== undefined && letterMatches[rawNormSpeech] < opts.length) {
      const idx = letterMatches[rawNormSpeech];
      onOptionSelect!(idx);
      setMatchFoundNotice(`Terdeteksi jawaban: "${opts[idx]}"`);
      return;
    }

    // 2. Check direct or partial match with option content strings
    let bestIdx = -1;
    let highestSim = 0;

    opts.forEach((optText, idx) => {
      const normOptArabic = normalizeArabicSpeechText(optText);
      const normOptRaw = optText.toLowerCase().trim();

      if (normOptArabic === normSpeechArabic || normOptRaw === rawNormSpeech) {
        bestIdx = idx;
        highestSim = 100;
      } else if (
        (normSpeechArabic && normOptArabic && (normSpeechArabic.includes(normOptArabic) || normOptArabic.includes(normSpeechArabic))) ||
        rawNormSpeech.includes(normOptRaw) ||
        normOptRaw.includes(rawNormSpeech)
      ) {
        if (highestSim < 80) {
          bestIdx = idx;
          highestSim = 80;
        }
      }
    });

    if (bestIdx !== -1 && onOptionSelect) {
      onOptionSelect(bestIdx);
      setMatchFoundNotice(`Terdeteksi jawaban: "${opts[bestIdx]}"`);
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
    utterance.rate = 0.85;

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
              Input Suara &amp; Jawaban Lisan
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Ucapkan jawaban ke mikrofon HP atau ketik pada kolom di bawah
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Read Question Audio Button */}
          {(questionArabic || questionText) && typeof window !== 'undefined' && 'speechSynthesis' in window && (
            <button
              type="button"
              onClick={handleReadQuestion}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer shrink-0 min-h-[36px] ${
                isSpeakingQuestion
                  ? 'bg-purple-600 text-white border-purple-600 animate-pulse'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title="Dengarkan Pengucapan Soal"
            >
              <Volume2 size={14} />
              <span className="text-[11px]">{isSpeakingQuestion ? 'Memutar...' : 'Dengar Soal'}</span>
            </button>
          )}

          {/* Language Toggle */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setSpeechLang('ar-SA')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                speechLang === 'ar-SA'
                  ? 'bg-purple-700 text-white font-extrabold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇸🇦 Arab
            </button>
            <button
              type="button"
              onClick={() => setSpeechLang('id-ID')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                speechLang === 'id-ID'
                  ? 'bg-purple-700 text-white font-extrabold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇮🇩 Indo
            </button>
          </div>
        </div>
      </div>

      {/* Web Speech API Unsupported Mobile Warning Banner */}
      {!isSpeechSupported && (
        <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs flex items-center gap-2">
          <Info size={16} className="text-amber-600 shrink-0" />
          <span>
            Fitur pengenalan suara langsung (Web Speech) tidak aktif di browser HP ini. <strong>Gunakan kolom ketik manual di bawah</strong> untuk menjawab kuis.
          </span>
        </div>
      )}

      {/* Mic Controls */}
      <div className="space-y-2.5">
        {isSpeechSupported && (
          <div className="flex flex-wrap items-center gap-2">
            {!isListening ? (
              <button
                type="button"
                onClick={handleStartListening}
                disabled={isPermissionRequesting}
                className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer min-h-[44px]"
              >
                <Mic size={18} className={isPermissionRequesting ? 'animate-spin' : 'animate-pulse'} />
                <span>
                  {isPermissionRequesting
                    ? 'Meminta Izin Mikrofon...'
                    : `Mulai Bicara (${speechLang === 'ar-SA' ? 'Bahasa Arab' : 'Bahasa Indonesia'})`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopListening}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer animate-pulse min-h-[44px]"
              >
                <MicOff size={18} />
                <span>Hentikan Rekaman</span>
              </button>
            )}

            {isListening && (
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900 bg-purple-100 px-3 py-2 rounded-xl border border-purple-200">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>Mendengarkan... Silakan bicara ke HP Anda</span>
              </div>
            )}
          </div>
        )}

        {/* Interim Text Preview during active listening */}
        {interimText && (
          <div className="p-2 bg-purple-50 border border-purple-200 rounded-xl text-xs italic text-purple-900">
            Mendengar: {interimText}...
          </div>
        )}

        {/* ALWAYS RENDER EDITABLE TEXT INPUT FALLBACK FOR ALL MOBILE / DESKTOP DEVICES */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between gap-2">
            <label className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
              <Keyboard size={14} className="text-purple-600" />
              <span>Teks Jawaban Anda (Hasil Suara / Ketik Manual):</span>
            </label>
            <span className="text-[10px] text-slate-500 italic">Dapat diketik manual</span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={transcript}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={placeholder}
              className={`w-full px-3.5 py-2.5 bg-white border-2 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none transition-all ${
                speechLang === 'ar-SA' ? 'font-arabic text-base dir-rtl' : ''
              } ${transcript ? 'border-purple-500 bg-purple-50/20' : 'border-slate-300 focus:border-purple-600'}`}
            />
            {transcript && (
              <button
                type="button"
                onClick={() => handleTextChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded-md hover:bg-slate-100"
                title="Hapus Teks"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Pronunciation Score Feedback Visualizer */}
        {pronunciationEval && pronunciationEval.score > 0 && (
          <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${pronunciationEval.badgeColor}`}>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white/80 rounded-lg shadow-2xs text-purple-700 shrink-0">
                <Award size={18} />
              </span>
              <div>
                <span className="text-xs font-black block leading-tight">
                  {pronunciationEval.label}
                </span>
                <span className="text-[11px] font-arabic font-bold opacity-80 block">
                  {pronunciationEval.arabicLabel}
                </span>
              </div>
            </div>

            {/* Score progress gauge bar */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-28 sm:w-32 bg-slate-200/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-300">
                <div
                  className="bg-purple-700 h-full rounded-full transition-all duration-500 shadow-2xs"
                  style={{ width: `${pronunciationEval.score}%` }}
                />
              </div>
              <span className="text-xs font-black font-mono px-2 py-0.5 bg-white rounded-md border border-slate-200 text-purple-950">
                {pronunciationEval.score}%
              </span>
            </div>
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
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

