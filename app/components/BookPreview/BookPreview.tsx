"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useMotionValue, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import ReadingProgress from "./ReadingProgress";
import PaywallTrigger from "../Paywall/PaywallTrigger";

interface BookPreviewProps {
  bookId: string;
  chapterTitle: string;
  content: string;
  isPreview?: boolean;
}

export default function BookPreview({ 
  bookId, 
  chapterTitle = "Foreword",
  content = `In the name of the Almighty

Dear reader,

I write this from my study, a place where countless stories have been born. But this story is different. It began not with imagination, but with a real encounter that changed everything.

It was winter, one of those cold days when hope seems as distant as the spring. A young person walked into my office, eighteen years old, at that age when one should be full of dreams, but their eyes seemed to have lived a hundred years.

"I want to change, but I don't know where to start. Everyone says to leave, to escape. But I want to stay and build. Am I crazy?"

In those eyes, I saw myself. The same confusion, the same fear, the same hope.`,
  isPreview = true 
}: BookPreviewProps) {
  const [readingProgress, setReadingProgress] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start start", "end end"]
  });

  const progressPercentage = useTransform(scrollYProgress, [0, 1], [0, 100]);

  useEffect(() => {
    const unsubscribe = progressPercentage.onChange(latest => {
      setReadingProgress(Math.min(latest, 25)); // Cap at 25% for preview
      if (latest > 20 && isPreview) {
        setShowPaywall(true);
      }
    });

    return () => unsubscribe();
  }, [progressPercentage, isPreview]);

  return (
    <section id="preview" className="py-20 bg-gradient-to-b from-transparent to-cultural-cream/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Preview Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-black text-cultural-brown mb-4">
            Book Preview
          </h2>
          <p className="text-xl text-gray-600">
            Read the first chapter completely free
          </p>
        </motion.div>

        {/* Book Content Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-2xl border border-cultural-gold/20 overflow-hidden"
        >
          {/* Decorative Top Bar */}
          <div className="h-1 bg-gradient-to-r from-cultural-gold via-cultural-blue to-cultural-green" />
          
          <div className="p-8 lg:p-12" ref={contentRef}>
            {/* Chapter Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-center text-cultural-brown mb-8">
              {chapterTitle}
            </h1>
            
            {/* Decorative Divider */}
            <div className="text-center text-2xl text-cultural-gold mb-8">❦</div>
            
            {/* Opening Quote */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-cultural-gold/10 to-cultural-gold/5 p-8 rounded-2xl text-center mb-12 relative"
            >
              <span className="absolute top-2 right-4 text-5xl text-cultural-gold/30">"</span>
              <p className="text-xl lg:text-2xl italic text-cultural-brown font-serif">
                Geography is not destiny, your inner essence shapes your fate
              </p>
              <span className="absolute bottom-2 left-4 text-5xl text-cultural-gold/30">"</span>
            </motion.div>
            
            {/* Book Content */}
            <div className="prose prose-lg lg:prose-xl max-w-none">
              {content.split('\n\n').map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="mb-6 text-gray-800 leading-relaxed font-serif"
                >
                  {paragraph.includes('"') ? (
                    <span className="bg-cultural-gold/20 px-2 py-1 rounded">
                      {paragraph}
                    </span>
                  ) : (
                    paragraph
                  )}
                </motion.p>
              ))}
            </div>
            
            {/* Story Box */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-cultural-brown/10 p-8 rounded-2xl border-l-4 border-cultural-brown my-12"
            >
              <h3 className="text-2xl font-bold text-cultural-brown mb-4">
                The Story That Changed Everything
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4 font-serif">
                Years ago, on one of winter's coldest days, a young person came to my office. 
                Eighteen years old, at that age when one should be full of hope, but their 
                eyes seemed to have lived a hundred years.
              </p>
              <p className="text-center italic text-cultural-brown text-xl my-6 font-serif">
                "Teacher, I want to change, but I don't know where to start. Everyone says 
                to leave, to run away. But I want to stay and build. Am I crazy?"
              </p>
              <p className="text-gray-700 leading-relaxed font-serif">
                In those eyes, I saw myself. The same confusion, the same fear, the same hope.
              </p>
            </motion.div>
            
            {/* Reading Progress */}
            <ReadingProgress 
              progress={readingProgress}
              totalReadingTime={15}
              remainingTime={15 - Math.floor(readingProgress / 100 * 15)}
            />
          </div>
          
          {/* Paywall Trigger */}
          {showPaywall && (
            <PaywallTrigger
              progress={readingProgress}
              onUnlock={() => setShowPaywall(false)}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}