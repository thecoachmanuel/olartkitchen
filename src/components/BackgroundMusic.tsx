import React, { useRef, useEffect } from 'react';

interface Track {
  id: string;
  name: string;
  url: string;
}

const MORNING_TRACK: Track = {
  id: 'morning',
  name: 'Lagos Chill Lounge (Morning Beat)',
  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
};

const AFTERNOON_TRACK: Track = {
  id: 'afternoon',
  name: 'Sunset Kitchen Groove (Afternoon Beat)',
  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
};

const NIGHT_TRACK: Track = {
  id: 'night',
  name: 'Naija Highlife Beat (Night Beat)',
  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
};

const getTrackByTime = (): Track => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    return MORNING_TRACK;
  } else if (hour >= 12 && hour < 18) {
    return AFTERNOON_TRACK;
  } else {
    return NIGHT_TRACK;
  }
};

interface BackgroundMusicProps {
  enabled: boolean;
  volume: number;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ enabled, volume }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<Track>(getTrackByTime());

  // Handle active playback and volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!enabled) {
      audio.pause();
      return;
    }

    const track = getTrackByTime();
    currentTrackRef.current = track;
    audio.src = track.url;
    audio.load();

    const startPlaying = () => {
      audio.play().catch((err) => {
        console.warn('Direct autoplay blocked by browser policy. Music will play upon first user interaction.', err);
      });
    };

    startPlaying();

    // Setup user interaction listeners to bypass autoplay browser restriction if it was blocked
    const resumeAudioOnInteraction = () => {
      if (enabled && audio.paused) {
        audio.play()
          .then(() => {
            // Success! Remove interaction listeners
            cleanupListeners();
          })
          .catch((err) => {
            console.warn('Playback resume failed:', err);
          });
      }
    };

    const cleanupListeners = () => {
      window.removeEventListener('click', resumeAudioOnInteraction);
      window.removeEventListener('touchstart', resumeAudioOnInteraction);
      window.removeEventListener('keydown', resumeAudioOnInteraction);
    };

    window.addEventListener('click', resumeAudioOnInteraction);
    window.addEventListener('touchstart', resumeAudioOnInteraction);
    window.addEventListener('keydown', resumeAudioOnInteraction);

    return () => {
      audio.pause();
      cleanupListeners();
    };
  }, [enabled]);

  return (
    <audio
      ref={audioRef}
      loop
      preload="auto"
      className="hidden animate-pulse"
      style={{ display: 'none' }}
    />
  );
};
