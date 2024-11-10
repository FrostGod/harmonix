import React from 'react';
import { Music2, Radio, Headphones, Sparkles, Save, Music4 } from 'lucide-react';

const features = [
  {
    name: 'Custom Music Generation',
    description: 'Generate unique music tracks based on website content and mood.',
    icon: Music2,
  },
  {
    name: 'EDM Tracks',
    description: 'Transform web content into energetic electronic dance music.',
    icon: Radio,
  },
  {
    name: 'Podcast Summaries',
    description: 'Convert articles into concise, engaging audio summaries.',
    icon: Headphones,
  },
  {
    name: 'AI-Powered',
    description: 'Advanced AI algorithms create perfectly matched audio content.',
    icon: Sparkles,
  },
  {
    name: 'Save Favorites',
    description: 'Store your favorite generated tracks for later listening.',
    icon: Save,
  },
  {
    name: 'Spotify Integration',
    description: 'Seamlessly save and sync with your Spotify playlists.',
    icon: Music4,
  },
];

export default function Features() {
  return (
    <div id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for an enhanced browsing experience
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <div className="flex items-center space-x-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <feature.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                    <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}