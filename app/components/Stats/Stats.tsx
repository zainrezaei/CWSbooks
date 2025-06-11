"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";

interface Stat {
  number: string;
  label: string;
  suffix?: string;
}

const stats: Stat[] = [
  { number: "15000", label: "Active Readers", suffix: "+" },
  { number: "95", label: "Positive Change Reported", suffix: "%" },
  { number: "42", label: "Countries Worldwide" },
  { number: "85", label: "Would Recommend", suffix: "%" },
];

export default function Stats() {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cultural-brown via-cultural-blue/90 to-cultural-black" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 cultural-pattern opacity-10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
            The Impact of Great Stories
          </h2>
          <p className="text-xl text-gray-200">
            Join thousands of readers transforming their lives through literature
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, index, inView }: { stat: Stat; index: number; inView: boolean }) {
  const [displayNumber, setDisplayNumber] = useState(0);
  
  useEffect(() => {
    if (!inView) return;
    
    const targetNumber = parseInt(stat.number);
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetNumber / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setDisplayNumber(Math.floor(increment * currentStep));
      } else {
        setDisplayNumber(targetNumber);
        clearInterval(timer);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [inView, stat.number]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="text-center p-6"
    >
      <motion.div
        animate={inView ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
        className="text-5xl lg:text-6xl font-black text-cultural-gold mb-2"
      >
        {displayNumber.toLocaleString()}{stat.suffix}
      </motion.div>
      <p className="text-lg text-gray-200">{stat.label}</p>
    </motion.div>
  );
}