"use client";

import { motion } from "framer-motion";

interface ReadingProgressProps {
  progress: number;
  totalReadingTime: number;
  remainingTime: number;
}

export default function ReadingProgress({ 
  progress, 
  totalReadingTime, 
  remainingTime 
}: ReadingProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-cultural-blue/10 to-cultural-blue/5 p-6 rounded-2xl border-l-4 border-cultural-blue my-8"
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-cultural-blue font-semibold">Reading Progress</span>
        <span className="text-cultural-blue font-semibold">{Math.round(progress)}% of Foreword</span>
      </div>
      
      {/* Progress Bar Container */}
      <div className="h-3 bg-cultural-blue/20 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-cultural-blue to-cultural-gold rounded-full relative progress-shimmer"
        />
      </div>
      
      <p className="mt-4 text-gray-600 text-sm flex items-center gap-4">
        <span>⏱️ {Math.floor(progress / 100 * totalReadingTime)} min read</span>
        <span>•</span>
        <span>{remainingTime} min remaining to complete Foreword</span>
      </p>
    </motion.div>
  );
}