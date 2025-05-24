import React from 'react';

interface PlayerControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  onPlayPause: () => void;
  onMute: () => void;
  onVolumeChange: (volume: number) => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  isMuted,
  volume,
  onPlayPause,
  onMute,
  onVolumeChange
}) => {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseInt(e.target.value, 10));
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return "fa-volume-mute";
    } else if (volume < 50) {
      return "fa-volume-down";
    } else {
      return "fa-volume-up";
    }
  };

  return (
    <div className="bg-[#1E1E1E] p-6">
      {/* Playback controls */}
      <div className="flex items-center justify-center space-x-8 mb-6">
        {/* Previous button (disabled for stream) */}
        <button className="text-white/40 hover:text-white/60 transition-colors" disabled>
          <i className="fas fa-step-backward text-xl"></i>
        </button>
        
        {/* Play/Pause button */}
        <button 
          className="bg-[#00E0FF] hover:bg-[#47EDFF] text-[#0A0A0A] w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#00E0FF] focus:ring-opacity-50"
          onClick={onPlayPause}
          data-state={isPlaying ? "playing" : "paused"}
        >
          <div className="flex items-center justify-center w-full h-full relative">
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-2xl absolute transform ${isPlaying ? '' : 'translate-x-0.5'}`}></i>
          </div>
        </button>
        
        {/* Next button (disabled for stream) */}
        <button className="text-white/40 hover:text-white/60 transition-colors" disabled>
          <i className="fas fa-step-forward text-xl"></i>
        </button>
      </div>
      
      {/* Connection status */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center px-3 py-1 rounded-full bg-[#0A0A0A]">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#1DB954]' : 'bg-gray-400'} mr-2`}></div>
          <span className="text-white/80 text-xs">
            {isPlaying ? 'Connected to stream' : 'Ready to connect'}
          </span>
        </div>
      </div>
      
      {/* Volume control */}
      <div className="flex items-center space-x-4">
        <button 
          className="text-white hover:text-[#00E0FF] transition-colors" 
          onClick={onMute}
        >
          <i className={`fas ${getVolumeIcon()} text-lg`}></i>
        </button>
        <div className="flex-1">
          <input 
            type="range" 
            className="w-full h-2 bg-[#0A0A0A] rounded-full appearance-none cursor-pointer" 
            min="0" 
            max="100" 
            value={isMuted ? 0 : volume} 
            onChange={handleVolumeChange}
          />
        </div>
        <span className="text-white/80 text-sm">{isMuted ? '0' : volume}%</span>
      </div>
    </div>
  );
};

export default PlayerControls;
