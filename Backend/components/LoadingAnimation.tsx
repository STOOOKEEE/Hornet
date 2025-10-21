import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface LoadingAnimationProps {
  onLaunchApp: () => void;
}

export function LoadingAnimation({ onLaunchApp }: LoadingAnimationProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient background gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 bg-gradient-radial from-blue-950/20 via-black to-black"
      />

      {/* Central glow behind logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.4, scale: 1.2 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute w-[500px] h-[500px] bg-gradient-radial from-blue-500/15 via-cyan-500/5 to-transparent rounded-full blur-3xl"
      />

      {/* Logo container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Descriptive text above logo */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ 
            duration: 1.2, 
            ease: [0.22, 1, 0.36, 1],
            delay: 0.1
          }}
          className="mb-8 md:mb-12"
        >
          <p className="text-gray-400 text-sm md:text-base tracking-wide text-center">
            AI-powered yield optimization for USDC on Base
          </p>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ 
            duration: 1.5, 
            ease: [0.22, 1, 0.36, 1],
            delay: 0.3
          }}
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center drop-shadow-2xl">
              <span className="text-white text-5xl font-bold">H</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ 
            duration: 1.2, 
            ease: [0.22, 1, 0.36, 1],
            delay: 1
          }}
          className="mt-8 md:mt-12"
        >
          <div className="text-white/90 text-3xl md:text-4xl tracking-[0.3em] uppercase text-center" 
               style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Hornet
          </div>
          
          {/* Animated underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              delay: 1.5
            }}
            className="h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent mt-4 origin-center"
          />
        </motion.div>

        {/* Subtitle or tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ 
            duration: 1, 
            delay: 2
          }}
          className="mt-6 text-gray-400 text-sm tracking-wider uppercase"
        >
          DeFi Yield Optimization
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 1, 
            delay: 2.5
          }}
          className="mt-12 flex items-center gap-4"
        >
          <motion.button
            onClick={onLaunchApp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-full bg-white text-black transition-all hover:bg-gray-100"
          >
            Launch App
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-full border border-white/10 text-white hover:bg-white/5 transition-colors"
          >
            Learn More
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ 
          duration: 1, 
          delay: 3
        }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-gray-500 text-xs uppercase tracking-wider">Scroll to explore</span>
        <motion.div
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </motion.div>

      {/* Subtle ambient particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`ambient-${i}`}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: typeof window !== 'undefined' ? window.innerHeight + 100 : 1000,
            opacity: 0,
          }}
          animate={{
            y: -100,
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: Math.random() * 4 + 4,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-0.5 h-0.5 rounded-full bg-blue-400/40"
        />
      ))}
    </div>
  );
}
