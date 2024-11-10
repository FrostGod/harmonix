import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '../assets/logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2">
              <Logo />
              <span className="text-xl font-bold text-pink-500">Harmonix</span>
            </a>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <a href="#features" className="text-gray-600 hover:text-pink-500">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-pink-500">How it Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-pink-500">Pricing</a>
            <button className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600">
              Install Extension
            </button>
          </div>

          <div className="sm:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="sm:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <a href="#features" className="text-gray-600 hover:text-pink-500 px-3 py-2">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-pink-500 px-3 py-2">How it Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-pink-500 px-3 py-2">Pricing</a>
              <button className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 mx-3">
                Install Extension
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}