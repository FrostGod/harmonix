import React from 'react';
import { Globe, Wand2, Music, Share2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      title: 'Browse Any Website',
      description: 'Visit your favorite websites while Harmonix runs in the background.',
      icon: Globe,
    },
    {
      title: 'AI Analysis',
      description: 'Our AI analyzes the content and mood of the page in real-time.',
      icon: Wand2,
    },
    {
      title: 'Generate Audio',
      description: 'Choose between music, EDM, or podcast format for your content.',
      icon: Music,
    },
    {
      title: 'Save & Share',
      description: 'Save your favorite generated tracks directly to Spotify.',
      icon: Share2,
    },
  ];

  return (
    <div id="how-it-works" className="py-24 bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-pink-500 font-semibold tracking-wide uppercase">How It Works</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Simple steps to upgrade your browsing
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-pink-100 text-pink-500 mb-6">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-12 transform translate-x-4">
                    <div className="h-0.5 w-full bg-pink-200"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}