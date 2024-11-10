import React from 'react';
import { Music2, Twitter, Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <Music2 className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Harmonix</span>
            </div>
            <p className="mt-4 text-gray-600">
              Transform your browsing experience with AI-powered audio content generation.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">Documentation</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">API</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">Terms of Service</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Connect</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                  <Twitter className="h-5 w-5 mr-2" />
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                  <Github className="h-5 w-5 mr-2" />
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-gray-400">&copy; {new Date().getFullYear()} Harmonix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}