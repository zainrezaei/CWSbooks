"use client";

import { motion } from "framer-motion";

interface Book3DProps {
  title: string;
  subtitle: string;
  author: string;
  onClick: () => void;
}

export default function Book3D({ title, subtitle, author, onClick }: Book3DProps) {
  return (
    <div className="perspective-1000">
      <motion.div
        whileHover={{ rotateY: -15, rotateX: 5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-[300px] sm:w-[350px] h-[450px] sm:h-[500px] relative cursor-pointer book-3d"
        onClick={onClick}
      >
        {/* Book Cover */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cultural-brown via-cultural-gold to-cultural-green opacity-90" />
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-tl from-black/20 via-transparent to-cultural-gold/30" />
          </div>
          
          {/* Content */}
          <div className="relative h-full flex flex-col justify-between p-8 text-white text-center">
            {/* Top Section */}
            <div>
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl font-black mb-2 drop-shadow-lg"
              >
                {title}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: 0.4 }}
                className="text-base sm:text-lg mb-4 opacity-90"
              >
                {subtitle}
              </motion.p>
            </div>
            
            {/* Center Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-6xl sm:text-7xl my-8 drop-shadow-2xl"
            >
              🏔️
            </motion.div>
            
            {/* Bottom Section */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-sm sm:text-base"
            >
              {author}
            </motion.p>
          </div>
          
          {/* Cultural Flag Bar at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-2 flag-colors-bar opacity-80" />
          
          {/* Book Spine Effect */}
          <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-black/20 to-transparent" />
          
          {/* Shine Effect */}
          <motion.div
            animate={{
              x: [-300, 300],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
          />
        </div>
        
        {/* Book Shadow */}
        <div className="absolute -bottom-4 left-4 right-4 h-8 bg-black/20 blur-xl rounded-full" />
      </motion.div>
    </div>
  );
}