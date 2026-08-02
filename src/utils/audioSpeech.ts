/**
 * Audio Speech Utility for Arabic Text-To-Speech (TTS)
 * Supports both Web Speech API (speechSynthesis) with Arabic voice auto-matching
 * and HTML5 Audio fallback (Google Translate TTS API) for seamless desktop/laptop & mobile playback.
 */

let currentAudio: HTMLAudioElement | null = null;

export const playArabicAudio = (
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): (() => void) => {
  if (!text || !text.trim()) {
    if (onError) onError();
    return () => {};
  }

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
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  const cleanText = text.trim();

  const handleStart = () => { if (onStart) onStart(); };
  const handleEnd = () => { if (onEnd) onEnd(); };
  const handleError = () => { if (onError) onError(); };

  // Multi-tier Audio Stream Fallback
  const playAudioFallback = () => {
    try {
      const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=ar&client=tw-ob`;
      const audio = new Audio(googleUrl);
      currentAudio = audio;

      audio.onplay = handleStart;
      audio.onended = () => {
        currentAudio = null;
        handleEnd();
      };

      audio.onerror = () => {
        // Backup audio provider (Youdao Arabic Dictionary TTS)
        const backupUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&le=ar`;
        const backupAudio = new Audio(backupUrl);
        currentAudio = backupAudio;

        backupAudio.onplay = handleStart;
        backupAudio.onended = () => {
          currentAudio = null;
          handleEnd();
        };
        backupAudio.onerror = () => {
          currentAudio = null;
          handleError();
        };

        backupAudio.play().catch(() => {
          currentAudio = null;
          handleError();
        });
      };

      audio.play().catch(() => {
        // Trigger error handler to switch to backup
        if (audio.onerror) {
          audio.onerror(new Event('error'));
        } else {
          handleError();
        }
      });
    } catch {
      handleError();
    }
  };

  // Try Web Speech API
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices() || [];
      const arabicVoice = voices.find(
        (v) => v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic')
      );
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      let started = false;

      utterance.onstart = () => {
        started = true;
        handleStart();
      };

      utterance.onend = () => {
        handleEnd();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        if (!started) {
          playAudioFallback();
        } else {
          handleError();
        }
      };

      window.speechSynthesis.speak(utterance);

      // Safety timer for browsers that don't trigger onstart immediately
      const timer = setTimeout(() => {
        if (!started && !currentAudio) {
          try {
            window.speechSynthesis.cancel();
          } catch {
            // ignore
          }
          playAudioFallback();
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        if (currentAudio) {
          try { currentAudio.pause(); currentAudio = null; } catch {}
        }
        if ('speechSynthesis' in window) {
          try { window.speechSynthesis.cancel(); } catch {}
        }
      };
    } catch {
      playAudioFallback();
    }
  } else {
    playAudioFallback();
  }

  return () => {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio = null; } catch {}
    }
  };
};
