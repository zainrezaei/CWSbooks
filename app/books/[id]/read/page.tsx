"use client";

import { useState } from "react";
import Header from "@/app/components/Header/Header";
import { motion } from "framer-motion";
import PaywallModal from "@/app/components/Paywall/PaywallModal";

export default function ReadBookPage({ params }: { params: { id: string } }) {
  const [showPaywall, setShowPaywall] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Mock data - in real app, fetch from Supabase
  const book = {
    id: params.id,
    title: "The Journey Within",
    author: "Sarah Mitchell",
    currentChapter: 1,
    chapterTitle: "Chapter 1: The Beginning",
    content: `The morning sun cast long shadows across the city streets as I made my way to the coffee shop that would change my life. I didn't know it then, of course. How could I? Life's most pivotal moments rarely announce themselves with fanfare.

I ordered my usual – a simple black coffee – and found a seat by the window. The steam rose from the cup, creating ephemeral patterns that dissolved into the air, much like the dreams I'd been chasing for years.

"Mind if I sit?" a voice asked.

I looked up to see an elderly man with kind eyes and a weathered face that spoke of countless stories. Something about him seemed familiar, though I was certain we'd never met.

"Please," I gestured to the empty chair.

What followed was a conversation that would reshape everything I thought I knew about success, happiness, and the geography of dreams...`
  };

  const handleUnlockContent = () => {
    setShowPaywall(false);
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-cultural-cream text-cultural-dark-brown"}`}>
      <Header />
      
      {/* Reading Controls */}
      <div className="fixed top-24 right-4 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Font Size</label>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
              >
                A+
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Theme</label>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setTheme("light")}
                className={`px-3 py-1 rounded ${theme === "light" ? "bg-cultural-gold text-white" : "bg-gray-200"}`}
              >
                ☀️
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`px-3 py-1 rounded ${theme === "dark" ? "bg-cultural-blue text-white" : "bg-gray-200"}`}
              >
                🌙
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Book Content */}
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Book Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
              <p className="text-lg opacity-80">by {book.author}</p>
            </div>
            
            {/* Chapter Title */}
            <h2 className="text-2xl font-bold mb-8">{book.chapterTitle}</h2>
            
            {/* Chapter Content */}
            <div 
              className="prose prose-lg max-w-none leading-relaxed"
              style={{ fontSize: `${fontSize}px` }}
            >
              {showPaywall ? (
                <>
                  <p className="mb-6">{book.content.substring(0, 200)}...</p>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-current opacity-95" />
                    <p className="blur-sm">{book.content.substring(200)}</p>
                  </div>
                </>
              ) : (
                book.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6">
                    {paragraph}
                  </p>
                ))
              )}
            </div>
          </motion.div>
          
          {/* Chapter Navigation */}
          {!showPaywall && (
            <div className="flex justify-between items-center mt-16 pt-8 border-t">
              <button className="flex items-center gap-2 text-cultural-blue hover:underline">
                ← Previous Chapter
              </button>
              <span className="text-sm opacity-60">Chapter 1 of 24</span>
              <button className="flex items-center gap-2 text-cultural-blue hover:underline">
                Next Chapter →
              </button>
            </div>
          )}
        </div>
      </main>
      
      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal
          onClose={() => {}}
          onSubscribe={handleUnlockContent}
        />
      )}
    </div>
  );
}