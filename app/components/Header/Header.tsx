"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#books", label: "Books" },
    { href: "#preview", label: "Preview" },
    { href: "#author", label: "Authors" },
    { href: "#community", label: "Community" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-gradient-to-r from-cultural-black via-cultural-brown to-cultural-blue/90 backdrop-blur-lg shadow-2xl"
          : "bg-gradient-to-r from-cultural-black via-cultural-brown to-cultural-blue"
      }`}
    >
      <div className="relative">
        {/* Cultural flag colors bar */}
        <div className="flag-colors-bar absolute bottom-0 left-0 right-0" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-gradient-to-br from-cultural-gold to-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-cultural-gold/40"
              >
                <span className="text-2xl">📚</span>
              </motion.div>
              <div className="text-white">
                <h1 className="text-xl font-bold tracking-tight">CWSbooks</h1>
                <p className="text-xs opacity-80">Wisdom Community</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white font-medium px-4 py-2 rounded-full hover:bg-cultural-gold/20 transition-all duration-300 hover:shadow-lg"
                >
                  {link.label}
                </Link>
              ))}
              <button className="bg-gradient-to-r from-cultural-gold to-cultural-orange text-white px-6 py-2 rounded-full font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                Sign In
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </nav>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gradient-to-b from-cultural-brown/95 to-cultural-black/95 backdrop-blur-lg"
            >
              <div className="px-4 py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-white font-medium px-4 py-3 rounded-lg hover:bg-cultural-gold/20 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <button className="w-full bg-gradient-to-r from-cultural-gold to-cultural-orange text-white px-6 py-3 rounded-full font-semibold">
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}