import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Mic, MicOff, Volume2, Sparkles, Send, X, RefreshCw, CheckCircle2,
  Award, Trophy, AlertCircle, VolumeX, Bot, User, Flame
} from 'lucide-react';
import { Materi, Student } from '../../types';
import { playArabicAudio } from '../../utils/audioSpeech';
import { generateHiwarAIResponse, HiwarChatMessage } from '../../services/geminiService';
import { evaluatePronunciationScore, PronunciationEvaluation } from '../../utils/pronunciationEvaluator';
import { storageService } from '../../services/storage';

interface LatihanBicaraHiwarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: Student;
  materiList: Materi[];
  onRewardExp?: (exp: number, reason: string) => void;
}

const PRESET_TOPICS = [
  {
    id: 'topic-1',
    title: 'Perkenalan (التعارف)',
    description: 'Saling menyapa, menanyakan nama, dan asal daerah.',
    arabicGreeting: 'السَّلَامُ عَلَيْكُمْ! أَنَا أُسْتَاذُ عَلِيٍّ، كَيْفَ حَالُكَ الْيَوْمَ؟',
    indoGreeting: '(Assalamu\'alaikum! Saya Ustaz Ali, bagaimana kabarmu hari ini?)',
  },
  {
    id: 'topic-2',
    title: 'Di Sekolah (في المدرسة)',
    description: 'Percakapan tentang kegiatan belajar dan mata pelajaran.',
    arabicGreeting: 'أَهْلًا وَسَهْلًا! مَاذَا تَدْرُسُ فِي الْمَدْرَسَةِ الْيَوْمَ؟',
    indoGreeting: '(Selamat datang! Apa yang kamu pelajari di sekolah hari ini?)',
  },
  {
    id: 'topic-3',
    title: 'Di Pasar (في السوق)',
    description: 'Percakapan jual beli dan menanyakan harga barang.',
    arabicGreeting: 'مَرْحَبًا بِكَ فِي السُّوقِ! مَاذَا تُرِيدُ أَنْ تَشْتَرِيَ؟',
    indoGreeting: '(Halo di pasar! Apa yang ingin kamu beli?)',
  },
  {
    id: 'topic-4',
    title: 'Hobi & Cita-Cita (الهواية والآمال)',
    description: 'Membahas kegemaran dan impian di masa depan.',
    arabicGreeting: 'أَهْلًا يَا بَطَلُ! مَا هِيَ هِوَايَتُكَ الْمُفَضَّلَةُ؟',
    indoGreeting: '(Halo wahai juara! Apa hobi favoritmu?)',
  },
];

export const LatihanBicaraHiwarModal: React.FC<LatihanBicaraHiwarModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  materiList,
  onRewardExp,
}) => {
  const [selectedTopic, setSelectedTopic] = useState(PRESET_TOPICS[0]);
  const [messages, setMessages] = useState<HiwarChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [currentEval, setCurrentEval] = useState<PronunciationEvaluation | null>(null);
  const [isSpeakingAi, setIsSpeakingAi] = useState(false);
  const [activeAudioMsgId, setActiveAudioMsgId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check speech recognition support
  const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Reset or initialize session when topic changes
  useEffect(() => {
    if (isOpen) {
      startNewSession(selectedTopic);
    }
  }, [isOpen, selectedTopic]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, interimText, isGeneratingAi]);

  const startNewSession = (topic: typeof PRESET_TOPICS[0]) => {
    const initialAiMsg: HiwarChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      arabicText: topic.arabicGreeting,
      translationText: topic.indoGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialAiMsg]);
    setInputText('');
    setCurrentEval(null);
    setErrorMsg(null);

    // Speak initial AI greeting
    speakArabic(initialAiMsg.arabicText, initialAiMsg.id);
  };

  const speakArabic = (text: string, msgId: string) => {
    setActiveAudioMsgId(msgId);
    setIsSpeakingAi(true);
    playArabicAudio(
      text,
      () => setIsSpeakingAi(true),
      () => {
        setIsSpeakingAi(false);
        setActiveAudioMsgId(null);
      },
      () => {
        setIsSpeakingAi(false);
        setActiveAudioMsgId(null);
      }
    );
  };

  const handleStartListening = () => {
    setErrorMsg(null);
    if (!isSpeechSupported) {
      setErrorMsg('Web Speech API tidak didukung di browser ini. Gunakan Google Chrome atau Edge.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimText('');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalStr = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalStr += res[0].transcript;
          } else {
            currentInterim += res[0].transcript;
          }
        }

        if (currentInterim) {
          setInterimText(currentInterim);
        }

        if (finalStr) {
          const cleanSpeech = finalStr.trim();
          setInputText(cleanSpeech);
          // Evaluate pronunciation score against latest AI message
          const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai');
          const evalResult = evaluatePronunciationScore(cleanSpeech, lastAiMsg?.arabicText || '');
          setCurrentEval(evalResult);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'no-speech') {
          setErrorMsg('Suara tidak terdeteksi. Silakan coba bicara lagi.');
        } else if (event.error === 'not-allowed') {
          setErrorMsg('Izin akses mikrofon ditolak.');
        } else {
          setErrorMsg(`Kendala perekam: ${event.error}`);
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
      setErrorMsg('Gagal mengaktifkan mikrofon: ' + err.message);
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

  const handleSendMessage = async () => {
    const textToSend = inputText.trim();
    if (!textToSend || isGeneratingAi) return;

    // Evaluate pronunciation
    const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai');
    const evalResult = evaluatePronunciationScore(textToSend, lastAiMsg?.arabicText || '');

    const userMsg: HiwarChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      arabicText: textToSend,
      pronunciationScore: evalResult.score,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setInterimText('');
    setCurrentEval(evalResult);
    setIsGeneratingAi(true);

    try {
      const aiReply = await generateHiwarAIResponse(selectedTopic.title, updatedMessages, textToSend);

      const aiMsg: HiwarChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        arabicText: aiReply.arabicText,
        translationText: aiReply.translationText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
      speakArabic(aiReply.arabicText, aiMsg.id);

      // Reward EXP for completing practice turns
      if (updatedMessages.filter(m => m.sender === 'user').length === 3) {
        if (onRewardExp) {
          onRewardExp(30, 'Menyelesaikan 3 Putaran Percakapan Hiwar AI');
        } else {
          storageService.checkAndUpdateStreak(currentStudent.id);
        }
      }
    } catch (err) {
      console.error('Error generating AI reply:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (!isOpen) return null;

  const userMessages = messages.filter(m => m.sender === 'user' && m.pronunciationScore !== undefined);
  const avgScore = userMessages.length > 0
    ? Math.round(userMessages.reduce((sum, m) => sum + (m.pronunciationScore || 0), 0) / userMessages.length)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full h-[90vh] max-h-[750px] flex flex-col overflow-hidden"
      >
        {/* Header Bar */}
        <div className="p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-2xl">
              <Bot size={22} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Latihan Bicara Hiwar AI</h3>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full">
                  ✨ Web Speech API
                </span>
              </div>
              <p className="text-xs text-emerald-200 font-medium">
                Praktik Percakapan Bahasa Arab Interaktif bersama Ustaz AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {avgScore > 0 && (
              <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Trophy size={14} className="text-amber-400" />
                <span>Rata-rata Skor: {avgScore}%</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Topic Selector Tabs */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-bold text-slate-600 shrink-0 ml-1">Pilih Topik:</span>
          {PRESET_TOPICS.map(topic => {
            const isSelected = selectedTopic.id === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {topic.title}
              </button>
            );
          })}
        </div>

        {/* Chat History Container */}
        <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-100/60">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isAi ? 'self-start' : 'self-end flex-row-reverse ml-auto'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isAi ? 'bg-emerald-700 text-white shadow-xs' : 'bg-purple-700 text-white shadow-xs'
                  }`}
                >
                  {isAi ? <Bot size={16} /> : <User size={16} />}
                </div>

                <div className={`space-y-1.5 ${isAi ? 'text-left' : 'text-right'}`}>
                  <div
                    className={`p-3.5 rounded-2xl shadow-2xs space-y-2 border ${
                      isAi
                        ? 'bg-white text-slate-900 border-slate-200 rounded-tl-xs'
                        : 'bg-purple-700 text-white border-purple-800 rounded-tr-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className={`font-arabic text-xl sm:text-2xl font-bold dir-rtl leading-relaxed ${
                        isAi ? 'text-emerald-950' : 'text-white'
                      }`}>
                        {msg.arabicText}
                      </p>
                      {isAi && (
                        <button
                          type="button"
                          onClick={() => speakArabic(msg.arabicText, msg.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                            activeAudioMsgId === msg.id && isSpeakingAi
                              ? 'bg-emerald-600 text-white animate-pulse'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                          title="Dengar pengucapan Ustaz AI"
                        >
                          <Volume2 size={16} />
                        </button>
                      )}
                    </div>

                    {msg.translationText && (
                      <p className={`text-xs font-medium italic ${isAi ? 'text-slate-600' : 'text-purple-100'}`}>
                        {msg.translationText}
                      </p>
                    )}

                    {/* Pronunciation Score Badge for User Turns */}
                    {msg.pronunciationScore !== undefined && (
                      <div className="pt-1 flex items-center justify-end">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 ${
                          msg.pronunciationScore >= 85
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : msg.pronunciationScore >= 70
                            ? 'bg-teal-100 text-teal-900 border-teal-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          <Award size={12} />
                          Akurasi Pengucapan: {msg.pronunciationScore}%
                        </span>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* AI Generating Loader */}
          {isGeneratingAi && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-3 rounded-2xl border border-emerald-200 max-w-xs animate-pulse">
              <Bot size={18} className="animate-spin text-emerald-600" />
              <span>Ustaz AI sedang mengetik & menyiapkan balasan...</span>
            </div>
          )}
        </div>

        {/* Live Pronunciation Score Feedback Badge */}
        {currentEval && currentEval.score > 0 && (
          <div className={`px-4 py-2 border-t font-bold text-xs flex items-center justify-between shrink-0 ${currentEval.badgeColor}`}>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm">{currentEval.label}</span>
              <span className="font-arabic text-base font-bold">({currentEval.arabicLabel})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${currentEval.score}%` }}
                />
              </div>
              <span className="text-xs font-black font-mono">{currentEval.score}%</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 shrink-0">
            <AlertCircle size={15} className="text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer Voice & Input Controls */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 space-y-3">
          <div className="flex items-center gap-2">
            {!isListening ? (
              <button
                type="button"
                onClick={handleStartListening}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
              >
                <Mic size={18} className="animate-pulse" />
                <span>Input Suara (🇸🇦 Arab)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopListening}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0 animate-pulse active:scale-95"
              >
                <MicOff size={18} />
                <span>Hentikan Rekaman</span>
              </button>
            )}

            {isListening && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-2 rounded-2xl border border-emerald-300 animate-pulse flex-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                <span className="truncate">Sedang mendengarkan... Ucapkan kalimat Arab Anda</span>
              </div>
            )}
          </div>

          {/* Transcript / Text Input Box */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={interimText ? interimText : inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ucapkan suara atau ketik kalimat Bahasa Arab Anda..."
              dir="rtl"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-arabic text-base sm:text-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white font-bold"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isGeneratingAi}
              className="p-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-2xl transition-all cursor-pointer shadow-xs shrink-0 active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
