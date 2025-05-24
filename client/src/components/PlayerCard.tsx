import { useState, useEffect } from "react";
import AudioVisualizer from "./AudioVisualizer";
import PlayerControls from "./PlayerControls";
import LoadingOverlay from "./LoadingOverlay";
import useAudioPlayer from "@/hooks/useAudioPlayer";
import axios from "axios";

// Direct URL for use in Vercel deployment
const STREAM_URL = "http://katolikusradio.hu:9000/radetzkyfm";

// Interface for the stream metadata
interface StreamMetadata {
  streamUrl: string;
  stationName: string;
  description: string;
  currentTrack: string;
  bitrate?: number;
  genre?: string;
  listeners?: number;
  serverType?: string;
}

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

  const [currentTrack, setCurrentTrack] = useState<string>("Loading track information...");
  const [stationMetadata, setStationMetadata] = useState<StreamMetadata | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(true);

  // Function to fetch metadata from our API endpoint
  const fetchMetadata = async () => {
    try {
      setMetadataLoading(true);
      const response = await axios.get<StreamMetadata>('/api/stream-info');
      
      if (response.data && response.data.currentTrack) {
        setCurrentTrack(response.data.currentTrack);
        setStationMetadata(response.data);
      }
    } catch (err) {
      console.error("Error fetching stream metadata:", err);
    } finally {
      setMetadataLoading(false);
    }
  };
  
  // Fetch metadata initially and then periodically
  useEffect(() => {
    // Fetch metadata immediately
    fetchMetadata();
    
    // Set up interval to refresh metadata
    const intervalId = setInterval(fetchMetadata, 30000); // every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <div className="glass w-full max-w-[90vw] sm:max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        {/* Header section with station info */}
        <div className="bg-gradient p-6 text-white text-center relative overflow-hidden">
          <h1 className="font-heading text-2xl font-bold mb-1">RadetzkyFM</h1>
          <p className="text-white/80 text-sm">Live Stream</p>

          {/* Main visualization */}
          <div className="mt-6 sm:mt-8 mb-4 sm:mb-6 relative h-40 sm:h-48 flex items-center justify-center">
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
                {metadataLoading ? (
                  <span className="animate-pulse">Loading track info...</span>
                ) : (
                  currentTrack
                )}
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
        <div className="bg-[#0A0A0A] p-3 sm:p-4 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="mb-2 sm:mb-0">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                <p className="text-white/80">Stream URL:</p>
                <p className="text-[#00E0FF] truncate max-w-full">
                  http://katolikusradio.hu:9000/radetzkyfm
                </p>
                
                {stationMetadata && (
                  <>
                    <p className="text-white/80">Genre:</p>
                    <p className="text-white/90">{stationMetadata.genre || 'Music'}</p>
                    
                    <p className="text-white/80">Bitrate:</p>
                    <p className="text-white/90">{stationMetadata.bitrate || '96'} kbps</p>
                    
                    <p className="text-white/80">Listeners:</p>
                    <p className="text-white/90">{stationMetadata.listeners || '0'}</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-center sm:justify-end space-x-4 mt-1 sm:mt-0">
              <button className="text-white/60 hover:text-white transition-colors p-2" aria-label="Favorite">
                <i className="fas fa-heart text-lg"></i>
              </button>
              <button className="text-white/60 hover:text-white transition-colors p-2" aria-label="Share">
                <i className="fas fa-share-alt text-lg"></i>
              </button>
              <button 
                className="text-white/60 hover:text-white transition-colors p-2" 
                aria-label="Information"
                onClick={fetchMetadata}
                title="Refresh metadata"
              >
                <i className="fas fa-sync-alt text-lg"></i>
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
