'use client';

import { useState } from 'react';
import DwijuHero from '@/components/DwijuHero';
import ChatInterface from '@/components/chat/ChatInterface';
import CategoryGrid from '@/components/CategoryGrid';
import Footer from '@/components/Footer';

export default function Home() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Dwiju AI Robo
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowChat(!showChat)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                {showChat ? 'Close Chat' : 'Ask Dwiju'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center">
          <DwijuHero />
          
          {/* Chat Interface Overlay */}
          {showChat && (
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
              <div className="h-full flex items-center justify-center p-4">
                <div className="w-full max-w-4xl h-[80vh] bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
                  <ChatInterface onClose={() => setShowChat(false)} />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Categories Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                1950+ Features Across 14 Categories
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Discover the comprehensive capabilities of Dwiju AI Robo - your all-in-one AI companion
                for education, healthcare, business, entertainment, and much more.
              </p>
            </div>
            <CategoryGrid />
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Powered by Advanced AI Technology
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Intelligent Chat</h3>
                <p className="text-gray-300">
                  Natural language conversations with context awareness and multi-language support.
                </p>
              </div>
              <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Voice Interaction</h3>
                <p className="text-gray-300">
                  Speech-to-text and text-to-speech with voice cloning capabilities.
                </p>
              </div>
              <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Computer Vision</h3>
                <p className="text-gray-300">
                  Real-time image analysis, OCR, object detection, and visual understanding.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
