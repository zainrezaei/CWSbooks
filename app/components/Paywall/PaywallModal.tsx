"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface PaywallModalProps {
  onClose: () => void;
  onSubscribe: () => void;
}

export default function PaywallModal({ onClose, onSubscribe }: PaywallModalProps) {
  useEffect(() => {
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-3xl max-w-2xl w-full p-8 lg:p-12 shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Modal Content */}
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="text-7xl mb-6"
            >
              📖
            </motion.div>
            
            <h3 className="text-4xl font-black text-cultural-brown mb-6">
              Unlock the Full Journey
            </h3>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto">
              Continue reading this transformative story and get access to our entire library 
              of inspiring books. Learn how to change your mindset and succeed regardless of 
              where you are.
            </p>
            
            {/* Pricing Options */}
            <div className="flex flex-col sm:flex-row gap-6 mb-8 justify-center">
              {/* Monthly Plan */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="border-3 border-cultural-gold rounded-2xl p-6 bg-gradient-to-br from-cultural-gold/10 to-cultural-gold/5 relative cursor-pointer"
                onClick={onSubscribe}
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-cultural-gold text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
                <div className="text-3xl font-bold text-cultural-brown">$9.99</div>
                <div className="text-gray-600">per month</div>
                <ul className="mt-4 text-sm text-gray-700 space-y-2">
                  <li>✓ Unlimited access</li>
                  <li>✓ New books weekly</li>
                  <li>✓ Reading progress sync</li>
                </ul>
              </motion.div>
              
              {/* Annual Plan */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="border-2 border-gray-300 rounded-2xl p-6 cursor-pointer relative"
                onClick={onSubscribe}
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-cultural-green text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Save 2 Months
                </div>
                <div className="text-3xl font-bold text-cultural-brown">$99</div>
                <div className="text-gray-600">per year</div>
                <ul className="mt-4 text-sm text-gray-700 space-y-2">
                  <li>✓ Everything in monthly</li>
                  <li>✓ 2 months free</li>
                  <li>✓ Priority support</li>
                </ul>
              </motion.div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSubscribe}
                className="btn-primary flex items-center justify-center gap-2"
              >
                🚀 Start Reading Now
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="btn-secondary"
              >
                Maybe Later
              </motion.button>
            </div>
            
            {/* Features */}
            <p className="mt-8 text-sm text-gray-500">
              ✓ Full book access &nbsp;&nbsp; ✓ Reading community &nbsp;&nbsp; ✓ Regular updates
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}