import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, Globe, Sparkles, Check, AlertCircle, RefreshCw, Award, Trophy, Edit3, Keyboard, Info, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp, Activity, HelpCircle } from 'lucide-react';
import { evaluatePronunciationScore, normalizeArabicSpeechText, analyzePronunciationError, PronunciationEvaluation, LevenshteinAnalysisResult } from '../../utils/pronunciationEvaluator';

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
  const [micPermissionState, setMicPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');

  // Web Audio API Visualizer state & refs
  const [audioSpectrum, setAudioSpectrum] = useState<number[]>([20, 35, 50, 75, 55, 40, 25, 15]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Tips panel toggle
  const [showTipsPanel, setShowTipsPanel] = useState(true);

  const recognitionRef = useRef<any>(null);

  // Check Web Speech API Support
  const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Check Microphone Permission status on mount & listen to changes
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((perm) => {
          setMicPermissionState(perm.state as any);
          perm.onchange = () => {
            setMicPermissionState(perm.state as any);
          };
        })
        .catch(() => {
          setMicPermissionState('unknown');
        });
    }
  }, []);

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

  // Clean up recognition & audio context on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      stopAudioVisualizer();
    };
  }, []);

  const startAudioVisualizer = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        const bars: number[] = [];
        for (let i = 0; i < 8; i++) {
          const val = dataArray[i] || 0;
          const pct = Math.min(100, Math.max(15, Math.round((val / 255) * 100)));
          bars.push(pct);
        }
        setAudioSpectrum(bars);
        animFrameRef.current = requestAnimationFrame(draw);
      };
      draw();
    } catch (err) {
      console.warn('Gagal memulai visualizer audio:', err);
    }
  };

  const stopAudioVisualizer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (_) {}
      audioCtxRef.current = null;
    }
  };

  const handleStartListening = async () => {
    setErrorMessage(null);
    setMatchFoundNotice(null);

    if (!isSpeechSupported) {
      setErrorMessage('Web Speech API tidak didukung natively di browser ini. Gunakan Chrome/Edge, atau gunakan kolom ketik manual di bawah.');
      return;
    }

    // Request microphone permission explicitly via getUserMedia first
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setIsPermissionRequesting(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setIsPermissionRequesting(false);
        setMicPermissionState('granted');
      }
    } catch (permErr: any) {
      setIsPermissionRequesting(false);
      if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
        setMicPermissionState('denied');
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
        startAudioVisualizer();
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

          const targetAnswer = questionArabic || questionText || (options && options.length > 0 ? options[0] : '');
          const evalRes = evaluatePronunciationScore(cleanFinal, targetAnswer);
          setPronunciationEval(evalRes);

          if (options && options.length > 0 && onOptionSelect) {
            matchOptionWithSpeech(cleanFinal, options);
          }
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        stopAudioVisualizer();
        const err = event.error;
        if (err === 'no-speech') {
          setErrorMessage('Suara tidak terdeteksi. Dekatkan mikrofon HP dan bicara lebih jelas.');
        } else if (err === 'not-allowed' || err === 'service-not-allowed') {
          setMicPermissionState('denied');
          setErrorMessage('Izin mikrofon ditolak/diblokir oleh browser ini. Izinkan mikrofon di pengaturan browser.');
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
        stopAudioVisualizer();
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      stopAudioVisualizer();
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
    stopAudioVisualizer();
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

  const matchOptionWithSpeech = (speechText: string, opts: string[]) => {
    const rawNormSpeech = speechText.toLowerCase().trim();
    const normSpeechArabic = normalizeArabicSpeechText(speechText);

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

  // Compute Levenshtein distance analysis when transcript & target answer exist
  const targetAnswerStr = questionArabic || questionText || (options && options.length > 0 ? options[0] : '');
  const levenshteinAnalysis: LevenshteinAnalysisResult | null = (transcript && transcript.trim() && targetAnswerStr)
    ? analyzePronunciationError(transcript, targetAnswerStr)
    : null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5">
      {/* 1. Header & Language Select */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
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

        <div className="flex items-center gap-2 flex-wrap">
          {/* Microphone Permission Status Badge */}
          {micPermissionState === 'granted' && (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[11px] font-extrabold flex items-center gap-1 shadow-2xs">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Izin Mikrofon: Diberikan</span>
            </span>
          )}
          {micPermissionState === 'denied' && (
            <span className="px-2.5 py-1 bg-rose-100 text-rose-900 border border-rose-300 rounded-lg text-[11px] font-extrabold flex items-center gap-1 shadow-2xs">
              <ShieldAlert size={13} className="text-rose-600 animate-pulse" />
              <span>Izin Mikrofon: Ditolak</span>
            </span>
          )}
          {micPermissionState === 'prompt' && (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-extrabold flex items-center gap-1">
              <Info size={13} className="text-amber-600" />
              <span>Perlu Akses Mikrofon</span>
            </span>
          )}

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

      {/* 2. Web Audio API Audio Visualizer & Recording Controls */}
      <div className="space-y-3">
        {isSpeechSupported && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2">
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
            </div>

            {/* REAL-TIME AUDIO VISUALIZER BARS (Web Audio API) */}
            {isListening && (
              <div className="flex items-center gap-3 bg-purple-50/80 px-3.5 py-2 rounded-xl border border-purple-200">
                <div className="flex items-center gap-1.5 shrink-0">
                  <Activity size={16} className="text-purple-600 animate-pulse" />
                  <span className="text-[11px] font-extrabold text-purple-900">Audio Visualizer:</span>
                </div>
                {/* 8 Frequency Spectrum Bars */}
                <div className="flex items-end gap-1 h-6 px-1">
                  {audioSpectrum.map((height, idx) => (
                    <motion.div
                      key={idx}
                      className="w-1.5 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-full"
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.08, ease: 'easeOut' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interim Text Preview during active listening */}
        {interimText && (
          <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs italic text-purple-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping shrink-0" />
            <span>Sedang Mendengar: "{interimText}..."</span>
          </div>
        )}

        {/* 3. Editable Text Input Fallback */}
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

        {/* 4. Levenshtein Distance & Pronunciation Accuracy Evaluation Card */}
        {pronunciationEval && pronunciationEval.score > 0 && (
          <div className="p-3.5 rounded-xl border bg-white border-slate-200 space-y-2.5 shadow-2xs">
            <div className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${pronunciationEval.badgeColor}`}>
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

            {/* Detailed Levenshtein Distance Error Breakdown */}
            {levenshteinAnalysis && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1 text-purple-800">
                    <Sparkles size={13} className="text-purple-600" />
                    Analisis Kesalahan Pelafalan (Levenshtein Distance):
                  </span>
                  <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-mono text-[10px]">
                    Selisih Fonetik: {levenshteinAnalysis.distance} karakter
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Teks Target Soal:</span>
                    <span className="font-extrabold text-slate-900 font-arabic text-sm dir-rtl block">
                      {targetAnswerStr}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Terdeteksi dari Suara Siswa:</span>
                    <span className="font-extrabold text-purple-900 font-arabic text-sm dir-rtl block">
                      {transcript}
                    </span>
                  </div>
                </div>

                {levenshteinAnalysis.errorFeedbackTips.length > 0 && (
                  <div className="pt-1 space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 block">
                      💡 Saran Koreksi Pelafalan Spesifik:
                    </span>
                    <ul className="space-y-1 pl-1">
                      {levenshteinAnalysis.errorFeedbackTips.map((tip, idx) => (
                        <li key={idx} className="text-[11px] text-slate-700 font-medium flex items-start gap-1">
                          <span className="text-amber-500 font-bold shrink-0">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notice if option matched */}
        {matchFoundNotice && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5">
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

        {/* 5. Panel 'Tips Pelafalan Hijaiyah & Fonetik' */}
        <div className="border border-purple-200 bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-white rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowTipsPanel(!showTipsPanel)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-extrabold text-purple-950 hover:bg-purple-100/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <HelpCircle size={15} className="text-purple-600" />
              <span>Tips Pelafalan Hijaiyah &amp; Fonetik Suara (Panduan Artikulasi)</span>
            </div>
            {showTipsPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showTipsPanel && (
            <div className="px-3.5 pb-3.5 pt-1 text-xs space-y-2 border-t border-purple-100/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-white/90 rounded-lg border border-purple-100 space-y-0.5">
                  <span className="font-bold text-purple-900 block">
                    1. Ta Marbutah (ة / ه)
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Bunyi 'ah' atau 'at' di akhir kata otomatis disamakan oleh sistem pengenal suara. Hembuskan bunyi 'h' halus secara artikulatif di akhir kata.
                  </p>
                </div>

                <div className="p-2 bg-white/90 rounded-lg border border-purple-100 space-y-0.5">
                  <span className="font-bold text-purple-900 block">
                    2. Dlommah Tanwin ( ٌ / un )
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Ucapkan vokal 'un' (seperti nun sukun) dengan jelas dan wajar. Jangan menahan atau menyeret pengucapan terlalu panjang.
                  </p>
                </div>

                <div className="p-2 bg-white/90 rounded-lg border border-purple-100 space-y-0.5">
                  <span className="font-bold text-purple-900 block">
                    3. Ain (ع) vs Hamzah (أ)
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Tekan artikulasi tenggorokan tengah saat mengucapkan Ain (ع) agar tidak tertukar dengan Hamzah (أ) dari pangkal tenggorokan.
                  </p>
                </div>

                <div className="p-2 bg-white/90 rounded-lg border border-purple-100 space-y-0.5">
                  <span className="font-bold text-purple-900 block">
                    4. Kecepatan &amp; Mikrofon HP
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Dekatkan mikrofon HP sekitar 10-15 cm dari mulut. Ucapkan kata secara utuh 1-2 detik setelah menekan tombol 'Mulai Bicara'.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
