import React from 'react';
import { Check } from 'lucide-react';

export default function Pricing() {
  const tiers = [
    {
      name: 'Free',
      price: '0',
      features: [
        'Generate up to 10 tracks per day',
        'Basic audio customization',
        'Save to local storage',
        'Standard quality audio',
      ],
    },
    {
      name: 'Pro',
      price: '9.99',
      features: [
        'Unlimited track generation',
        'Advanced audio customization',
        'Spotify integration',
        'High quality audio',
        'Priority support',
        'Custom themes',
      ],
    },
  ];

  return (
    <div id="pricing" className="py-24 bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-pink-500 font-semibold tracking-wide uppercase">Pricing</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Choose your plan
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Start for free or upgrade for unlimited features
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="rounded-lg shadow-lg overflow-hidden bg-white transform hover:scale-105 transition-transform duration-200 border-2 hover:border-pink-200"
            >
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-pink-500">{tier.name}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">${tier.price}</span>
                  <span className="text-base font-medium text-gray-500">/month</span>
                </p>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-pink-500" />
                      <span className="ml-3 text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-8 w-full bg-pink-500 text-white py-3 px-6 rounded-md hover:bg-pink-600 transition-colors">
                  {tier.name === 'Free' ? 'Get Started' : 'Upgrade Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}