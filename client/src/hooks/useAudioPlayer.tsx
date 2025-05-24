import { useState, useRef, useEffect } from 'react';

interface AudioPlayerState {
  audioRef: React.RefObject<HTMLAudioElement>;
  audioContext: AudioContext | null;
  audioSource: MediaElementAudioSourceNode | null;
  isPlaying: boolean;
  isLoading: boolean;
  isMuted: boolean;
  volume: number;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  error: string | null;
}

/**
 * Custom hook to manage the audio player state and functionality
 */
const useAudioPlayer = (streamUrl: string): AudioPlayerState => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize audio context once the audio element is available
  useEffect(() => {
    if (!audioRef.current || isInitialized) return;
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const context = new AudioContextClass();
        setAudioContext(context);
        
        const source = context.createMediaElementSource(audioRef.current);
        source.connect(context.destination);
        setAudioSource(source);
        
        // Set initial volume
        if (audioRef.current) {
          audioRef.current.volume = volume / 100;
        }
        
        setIsInitialized(true);
        console.log('Audio context initialized successfully');
      } else {
        setError('AudioContext not supported in your browser');
      }
    } catch (err) {
      console.error('Error initializing audio context:', err);
      setError('Could not initialize audio player');
    }
  }, [audioRef.current, isInitialized]);

  // Add event listeners to audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      if (audio) setVolume(Math.round(audio.volume * 100));
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setError('Error loading the audio stream. Please try again later.');
      if (audio) console.error('Audio error:', audio.error);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [audioRef.current]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Playback controls
  const play = async () => {
    if (!audioRef.current) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Resume audio context if needed
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Unable to play the stream. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(!isMuted);
  };

  const handleSetVolume = (newVolume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = newVolume / 100;
    setVolume(newVolume);
    
    // If adjusting volume while muted, unmute
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    }
  };

  return {
    audioRef,
    audioContext,
    audioSource,
    isPlaying,
    isLoading,
    isMuted,
    volume,
    play,
    pause,
    togglePlayPause,
    toggleMute,
    setVolume: handleSetVolume,
    error
  };
};

export default useAudioPlayer;
