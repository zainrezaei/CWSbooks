"use client";

import { motion } from "framer-motion";
import Book3D from "./Book3D";
import { useRouter } from "next/navigation";

interface HeroProps {
  book?: {
    id: string;
    title: string;
    subtitle: string;
    author: string;
    description: string;
  };
}

export default function Hero({ 
  book = {
    id: "1",
    title: "The Journey Within",
    subtitle: "A Story of Transformation and Discovery",
    author: "Sarah Mitchell",
    description: "A transformative tale that every young reader should explore. A real story of mindset change, overcoming limitations, and discovering that success is not dependent on location, but on the mind."
  }
}: HeroProps) {
  const router = useRouter();

  const handleStartReading = () => {
    router.push(`/books/${book.id}/read`);
  };

  const scrollToPreview = () => {
    document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 cultural-pattern" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cultural-gold/10 via-transparent to-cultural-green/10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-5xl lg:text-7xl font-black text-cultural-brown mb-4">
              {book.title}
            </h1>
            
            <p className="text-xl lg:text-2xl text-cultural-blue italic mb-8">
              {book.subtitle}
            </p>
            
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {book.description}
            </p>
            
            {/* Author Info Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-cultural-gold/20 to-cultural-gold/10 p-6 rounded-2xl border-l-4 border-cultural-gold mb-8"
            >
              <h3 className="text-xl font-bold text-cultural-brown mb-2">
                About the Author
              </h3>
              <p className="text-gray-600 italic">
                Written by {book.author}, an inspiring voice in contemporary literature 
                who brings fresh perspectives on personal growth and transformation.
              </p>
            </motion.div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartReading}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <span className="text-xl">📖</span>
                Start Reading Free
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToPreview}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <span className="text-xl">👁️</span>
                Preview Book
              </motion.button>
            </div>
          </motion.div>
          
          {/* 3D Book Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex justify-center"
          >
            <Book3D
              title={book.title}
              subtitle={book.subtitle}
              author={book.author}
              onClick={handleStartReading}
            />
          </motion.div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-8 h-8 text-cultural-gold"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}