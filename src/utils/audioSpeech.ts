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
  // Stop any playing HTML5 audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  // Stop any SpeechSynthesis
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  const cleanText = text.replace(/[^\u0600-\u06FF\s]/g, '').trim() || text;

  // Helper to trigger end/error handlers
  const handleStart = () => {
    if (onStart) onStart();
  };
  const handleEnd = () => {
    if (onEnd) onEnd();
  };
  const handleError = () => {
    if (onError) onError();
  };

  // Helper for Google Translate Audio stream fallback
  const playGoogleFallback = () => {
    try {
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        cleanText
      )}&tl=ar&client=tw-ob`;
      
      const audio = new Audio(audioUrl);
      currentAudio = audio;

      audio.onplay = handleStart;
      audio.onended = () => {
        currentAudio = null;
        handleEnd();
      };
      audio.onerror = () => {
        currentAudio = null;
        handleError();
      };

      audio.play().catch(() => {
        currentAudio = null;
        handleError();
      });
    } catch {
      handleError();
    }
  };

  // Check Web Speech API support
  if (!('speechSynthesis' in window)) {
    playGoogleFallback();
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
    };
  }

  try {
    window.speechSynthesis.resume(); // Ensure Chrome desktop is unpaused
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(
      (v) => v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic')
    );

    // If no Arabic voice installed on laptop OS, fall back to Google Audio stream directly
    if (!arabicVoice && voices.length > 0) {
      playGoogleFallback();
      return () => {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio = null;
        }
      };
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;

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

    utterance.onerror = () => {
      if (!started) {
        // Fallback to Google audio stream on WebSpeech error
        playGoogleFallback();
      } else {
        handleError();
      }
    };

    window.speechSynthesis.speak(utterance);

    // Safety timeout check for desktop Chrome stuck speech
    setTimeout(() => {
      if (!started && !currentAudio) {
        window.speechSynthesis.cancel();
        playGoogleFallback();
      }
    }, 400);

  } catch {
    playGoogleFallback();
  }

  return () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  };
};
