import React from 'react';
import { Music2, Radio, Headphones, Sparkles, Save, Music4 } from 'lucide-react';

const features = [
  {
    name: 'Custom Music Generation',
    description: 'Generate lyrical songs to memorize website facts.',
    icon: Music2,
  },
  {
    name: 'EDM Tracks',
    description: 'Immerse yourself in content with tailored electronic dance music.',
    icon: Headphones,
  },
  {
    name: 'Podcast Summaries',
    description: 'Convert text into concise, engaging audio summaries.',
    icon: Radio,
  },

];

export default function Features() {
  return (
    <div id="features" className="py-24 bg-gradient-to-b from-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-pink-500 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Every audio you need to enhance memorization  
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <div className="flex items-center space-x-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow hover:border-pink-200 border-2">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pink-500 text-white">
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