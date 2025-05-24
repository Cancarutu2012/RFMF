import React from 'react';
import PlayerCard from '@/components/PlayerCard';
import { Helmet } from 'react-helmet';

const Home: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>RadetzkyFM - Catholic Radio Stream Player</title>
        <meta name="description" content="Listen to RadetzkyFM Catholic Radio stream with beautiful visualizations and a modern interface." />
        <meta property="og:title" content="RadetzkyFM - Catholic Radio Stream Player" />
        <meta property="og:description" content="Listen to RadetzkyFM Catholic Radio stream with beautiful visualizations and a modern interface." />
        <meta property="og:type" content="website" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </Helmet>
      
      <div className="relative min-h-screen overflow-hidden">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden bg-[#121212] -z-10">
          {/* A visualization of circular sound wave pattern in purple tones */}
          <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient opacity-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin-slow blur-xl"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin-slow blur-md" style={{ animationDirection: 'reverse' }}></div>
          
          {/* Floating circles */}
          <div className="absolute w-24 h-24 rounded-full bg-[#8E2DE2] opacity-20 top-1/4 left-1/4 animate-float blur-md"></div>
          <div className="absolute w-16 h-16 rounded-full bg-[#00E0FF] opacity-15 bottom-1/4 right-1/4 animate-float blur-sm" style={{ animationDelay: '1s' }}></div>
          <div className="absolute w-32 h-32 rounded-full bg-[#4A00E0] opacity-10 bottom-1/3 left-1/3 animate-float blur-lg" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Main content container */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-10">
          <PlayerCard />

          {/* Audio element is managed by the useAudioPlayer hook in PlayerCard component */}
        </main>
        
        {/* Footer */}
        <footer className="fixed bottom-4 w-full text-center text-white/50 text-xs z-10">
          <p>© {new Date().getFullYear()} RadetzkyFM Player • All Rights Reserved</p>
        </footer>
      </div>
    </>
  );
};

export default Home;
