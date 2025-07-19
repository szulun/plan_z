'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 mb-0"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-2 bg-gradient-to-br from-pink-200 via-purple-200 to-pink-300 rounded-xl"
            >
              <TrendingUp className="w-8 h-8 text-white" />
            </motion.div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse shadow-lg"></div>
          </div>
          <div>
            <h1
              className="text-5xl font-black tracking-tight mb-2 text-left font-heading"
              style={{ fontFamily: 'var(--font-sacramento), cursive', letterSpacing: '2px', color: '#222', lineHeight: 1 }}
            >
              Plan B
            </h1>
            <p className="text-gray-600 text-xl font-montserrat-alt tracking-wide text-left">
              Portfolio Manager
            </p>
          </div>
        </div>
        {/* 右上角 Journal 按鈕已移除 */}
      </div>
    </motion.header>
  );
} 