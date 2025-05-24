import React from 'react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#0A0A0A]/80 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient animate-spin mb-4">
          <div className="w-12 h-12 rounded-full bg-[#0A0A0A]"></div>
        </div>
        <p className="text-white font-medium">Connecting to stream...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
