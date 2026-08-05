/**
 * Audio Diagnostics Utility
 * Detects Web Audio API, HTML5 Audio, Speech Synthesis, and Speech Recognition
 * capabilities on mobile and legacy browsers, providing fallback diagnostic messages.
 */

export interface AudioDiagnosticResult {
  hasWebAudio: boolean;
  hasHtml5Audio: boolean;
  hasSpeechSynthesis: boolean;
  hasSpeechRecognition: boolean;
  isFullySupported: boolean;
  warningMessage: string | null;
}

export function checkAudioCapabilities(): AudioDiagnosticResult {
  if (typeof window === 'undefined') {
    return {
      hasWebAudio: false,
      hasHtml5Audio: false,
      hasSpeechSynthesis: false,
      hasSpeechRecognition: false,
      isFullySupported: false,
      warningMessage: 'Sistem dijalankan di lingkungan non-browser.',
    };
  }

  const hasWebAudio = !!(window.AudioContext || (window as any).webkitAudioContext);
  const hasHtml5Audio = typeof Audio !== 'undefined';
  const hasSpeechSynthesis = 'speechSynthesis' in window;
  const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  const isFullySupported = hasHtml5Audio && (hasWebAudio || hasSpeechSynthesis);

  let warningMessage: string | null = null;

  if (!hasHtml5Audio && !hasWebAudio) {
    warningMessage = 'Perangkat Anda tidak mendukung pemutaran suara Web Audio / HTML5 Audio. Suara kuis & audio tidak dapat diputar.';
  } else if (!hasSpeechSynthesis) {
    warningMessage = 'Perangkat Anda tidak memiliki fitur sintesis suara bawaan (Web Speech API). Sistem menggunakan audio streaming alternatif.';
  } else if (!hasSpeechRecognition) {
    warningMessage = 'Browser Anda belum mendukung Microfon Pengenal Suara (Speech Recognition). Gunakan Google Chrome versi terbaru untuk kuis suara lisan.';
  }

  return {
    hasWebAudio,
    hasHtml5Audio,
    hasSpeechSynthesis,
    hasSpeechRecognition,
    isFullySupported,
    warningMessage,
  };
}

export function getAudioFallbackMessage(): string | null {
  const diag = checkAudioCapabilities();
  return diag.warningMessage;
}
