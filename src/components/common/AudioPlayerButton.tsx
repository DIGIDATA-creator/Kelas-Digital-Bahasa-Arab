import React, { useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { playArabicAudio } from '../../utils/audioSpeech';

interface AudioPlayerButtonProps {
  arabicText: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({
  arabicText,
  size = 'md',
  className = '',
  label,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!arabicText) return;

    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    playArabicAudio(
      arabicText,
      () => setIsPlaying(true),
      () => setIsPlaying(false),
      () => setIsPlaying(false)
    );
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <button
      onClick={speak}
      type="button"
      title="Dengarkan pengucapan Bahasa Arab"
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 border shadow-xs active:scale-95 ${
        isPlaying
          ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
      } ${sizeClasses[size]} ${className}`}
    >
      {isPlaying ? (
        <Loader2 size={iconSizes[size]} className="animate-spin" />
      ) : (
        <Volume2 size={iconSizes[size]} />
      )}
      {label && <span>{label}</span>}
      {isPlaying && (
        <span className="flex items-center gap-0.5 ml-1">
          <span className="w-1 h-3 bg-white rounded-full animate-bounce"></span>
          <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:0.1s]"></span>
          <span className="w-1 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
        </span>
      )}
    </button>
  );
};
