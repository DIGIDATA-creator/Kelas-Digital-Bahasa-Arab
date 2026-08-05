/**
 * Audio Speech Utility for Arabic & Indonesian Text-To-Speech (TTS)
 * Supports both Web Speech API (speechSynthesis) with voice auto-matching
 * and multi-tier HTML5 Audio fallback (Google Translate TTS API, GTX, Youdao)
 * for seamless desktop/laptop & mobile device playback.
 */

let currentAudio: HTMLAudioElement | null = null;

export const playAudio = (
  text: string,
  langCode: 'ar' | 'id' = 'ar',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): (() => void) => {
  if (!text || !text.trim()) {
    if (onError) onError();
    return () => {};
  }

  const cleanText = text.trim();
  const isArabic = langCode === 'ar' || /[\u0600-\u06FF]/.test(cleanText);
  const targetLang = isArabic ? 'ar' : 'id';
  const targetLangSpeech = isArabic ? 'ar-SA' : 'id-ID';

  // Stop any playing HTML5 audio
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio = null;
    } catch {
      // ignore
    }
  }

  // Stop any previous SpeechSynthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  const handleStart = () => { if (onStart) onStart(); };
  const handleEnd = () => { if (onEnd) onEnd(); };
  const handleError = () => { if (onError) onError(); };

  // Prepare fallback audio URLs
  const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${targetLang}&client=tw-ob`;
  const gtxUrl = `https://translate.googleapis.com/translate_tts?client=gtx&sl=${targetLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(cleanText)}`;
  const backupUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&le=${targetLang}`;

  // Synchronously instantiate Audio element inside click handler stack to satisfy mobile browser user-activation rules
  const audio = new Audio(googleUrl);
  audio.crossOrigin = 'anonymous';
  currentAudio = audio;

  let currentTier = 1;

  const tryNextAudioTier = () => {
    currentTier++;
    if (currentTier === 2) {
      audio.src = gtxUrl;
      audio.play().catch(() => tryNextAudioTier());
    } else if (currentTier === 3) {
      audio.src = backupUrl;
      audio.play().catch(() => {
        currentAudio = null;
        handleError();
      });
    } else {
      currentAudio = null;
      handleError();
    }
  };

  audio.onplay = handleStart;
  audio.onended = () => {
    currentAudio = null;
    handleEnd();
  };
  audio.onerror = () => {
    tryNextAudioTier();
  };

  // Check if Web Speech API is present and has a native voice loaded
  let hasNativeVoice = false;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      hasNativeVoice = voices.some(v =>
        v.lang.toLowerCase().startsWith(targetLang) ||
        (isArabic && v.name.toLowerCase().includes('arabic')) ||
        (!isArabic && (v.name.toLowerCase().includes('indonesia') || v.lang.toLowerCase().startsWith('id')))
      );
    } catch {
      hasNativeVoice = false;
    }
  }

  // Try Web Speech API if ready and voice matched, otherwise fall back to HTML5 Audio
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && hasNativeVoice) {
    try {
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = targetLangSpeech;
      utterance.rate = 0.85;

      const voices = window.speechSynthesis.getVoices() || [];
      const matchVoice = voices.find(v =>
        v.lang.toLowerCase().startsWith(targetLang) ||
        (isArabic && v.name.toLowerCase().includes('arabic')) ||
        (!isArabic && (v.name.toLowerCase().includes('indonesia') || v.lang.toLowerCase().startsWith('id')))
      );
      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      utterance.onstart = handleStart;
      utterance.onend = handleEnd;
      utterance.onerror = () => {
        // Fallback to pre-instantiated audio element
        audio.play().catch(() => tryNextAudioTier());
      };

      window.speechSynthesis.speak(utterance);

      return () => {
        if (currentAudio) {
          try { currentAudio.pause(); currentAudio = null; } catch {}
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try { window.speechSynthesis.cancel(); } catch {}
        }
      };
    } catch {
      audio.play().catch(() => tryNextAudioTier());
    }
  } else {
    // Play HTML5 streaming audio directly
    audio.play().catch(() => tryNextAudioTier());
  }

  return () => {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio = null; } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
  };
};

export const playArabicAudio = (
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): (() => void) => {
  return playAudio(text, 'ar', onStart, onEnd, onError);
};

