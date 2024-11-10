import React from 'react';
import { Music2, Headphones, Radio } from 'lucide-react';

export default function Hero() {
  const handleInstallClick = () => {
    window.open('https://chrome.google.com/webstore', '_blank');
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white to-pink-50">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Transform your browsing with</span>
                <span className="block text-pink-500">personalized audio content</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Generate custom music, EDM tracks, or podcast summaries based on the websites you visit. Save your favorites directly to Spotify.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-500 hover:bg-pink-600 transition-colors md:py-4 md:text-lg md:px-10"
                  >
                    Install Extension
                  </button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <a
                    href="#how-it-works"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-pink-500 bg-pink-100 hover:bg-pink-200 transition-colors md:py-4 md:text-lg md:px-10"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </main>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <div className="h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center gap-8 p-8">
              <Music2 className="h-16 w-16 text-pink-500 animate-bounce" />
              <Headphones className="h-16 w-16 text-pink-400 animate-pulse" />
              <Radio className="h-16 w-16 text-pink-300 animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}