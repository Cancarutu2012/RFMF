import { useState, useEffect, useRef } from "react";
import AudioVisualizer from "./AudioVisualizer";
import PlayerControls from "./PlayerControls";
import LoadingOverlay from "./LoadingOverlay";
import useAudioPlayer from "@/hooks/useAudioPlayer";

const STREAM_URL = "http://katolikusradio.hu:9000/radetzkyfm";

const PlayerCard: React.FC = () => {
  const {
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
    setVolume,
    error,
  } = useAudioPlayer(STREAM_URL);

  const [currentTrack, setCurrentTrack] = useState<string>(
    "Catholic Radio Stream",
  );

  // Function to periodically check for metadata updates (if supported by the stream)
  useEffect(() => {
    if (!audioRef.current) return;

    const updateMetadata = () => {
      if (audioRef.current) {
        // Some streams provide metadata
        if ("mediaSession" in navigator && navigator.mediaSession.metadata) {
          const title = navigator.mediaSession.metadata.title;
          if (title) setCurrentTrack(title);
        }
      }
    };

    const intervalId = setInterval(updateMetadata, 5000);
    return () => clearInterval(intervalId);
  }, [audioRef]);

  return (
    <>
      <div className="glass w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        {/* Header section with station info */}
        <div className="bg-gradient p-6 text-white text-center relative overflow-hidden">
          <h1 className="font-heading text-2xl font-bold mb-1">RadetzkyFM</h1>
          <p className="text-white/80 text-sm">Live Stream</p>

          {/* Main visualization */}
          <div className="mt-8 mb-6 relative h-48 flex items-center justify-center">
            <div
              id="visualization-container"
              className="relative w-full h-full flex items-center justify-center"
            >
              <AudioVisualizer
                audioContext={audioContext}
                audioSource={audioSource}
                isPlaying={isPlaying}
              />
            </div>

            {/* Now playing overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/30 backdrop-blur-sm rounded-t-xl">
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full ${isPlaying ? "bg-[#1DB954]" : "bg-gray-400"} mr-2 animate-pulse`}
                ></div>
                <p className="text-sm font-semibold">Now Playing</p>
              </div>
              <p className="text-white/80 text-xs mt-1 truncate">
                {currentTrack}
              </p>
            </div>
          </div>
        </div>

        {/* Player controls */}
        <PlayerControls
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          onPlayPause={togglePlayPause}
          onMute={toggleMute}
          onVolumeChange={setVolume}
        />

        {/* Station information */}
        <div className="bg-[#0A0A0A] p-4 border-t border-white/5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/80 text-xs">Stream URL:</p>
              <p className="text-[#00E0FF] text-xs truncate max-w-[200px]">
                {STREAM_URL}
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="text-white/60 hover:text-white transition-colors">
                <i className="fas fa-heart text-lg"></i>
              </button>
              <button className="text-white/60 hover:text-white transition-colors">
                <i className="fas fa-share-alt text-lg"></i>
              </button>
              <button className="text-white/60 hover:text-white transition-colors">
                <i className="fas fa-info-circle text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audio element (hidden) */}
      <audio
        ref={audioRef}
        src={STREAM_URL}
        preload="auto"
        style={{ display: 'none' }}
      />

      {/* Loading overlay */}
      {isLoading && <LoadingOverlay />}

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <p>Error loading stream: {error}</p>
        </div>
      )}
    </>
  );
};

export default PlayerCard;
