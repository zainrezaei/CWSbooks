"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import PaywallModal from "./PaywallModal";

interface PaywallTriggerProps {
  progress: number;
  onUnlock: () => void;
}

export default function PaywallTrigger({ progress, onUnlock }: PaywallTriggerProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-br from-cultural-gold/10 via-cultural-blue/10 to-cultural-green/10 border-2 border-dashed border-cultural-gold rounded-3xl p-12 text-center mx-8 mb-8 cursor-pointer hover:shadow-2xl transition-all duration-300"
        onClick={() => setShowModal(true)}
        whileHover={{ y: -5 }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
          }}
          className="text-6xl mb-4"
        >
          🔓
        </motion.div>
        
        <h3 className="text-3xl font-bold text-cultural-brown mb-4">
          Continue This Inspiring Journey
        </h3>
        
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          You've read {Math.round(progress)}% of the foreword. To continue reading and discover 
          the secrets of life transformation, join the Wisdom Community.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary text-lg px-10 py-4"
        >
          🚀 Get Full Access - $9.99/month
        </motion.button>
        
        <p className="mt-6 text-sm text-gray-500">
          Cancel anytime • Instant access • New books added weekly
        </p>
      </motion.div>
      
      {showModal && (
        <PaywallModal 
          onClose={() => setShowModal(false)}
          onSubscribe={() => {
            setShowModal(false);
            onUnlock();
          }}
        />
      )}
    </>
  );
}