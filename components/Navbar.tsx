import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Hornet from '../styles/Hornet.png';
import Image from 'next/image';

interface NavbarProps {
  onLaunchApp: () => void;
}

export function Navbar({ onLaunchApp }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3"
        >
          <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center relative">
            <Image
              src={Hornet}
              alt="Hornet"
              layout="fill"
              objectFit="cover"
              className="object-center"
            />
          </div>
          <span className="text-xl text-white">Hornet</span>
        </motion.div>

        <div className="hidden md:flex items-center gap-12">
          <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
            Features
          </a>
          <a href="#how" className="text-sm text-gray-400 hover:text-white transition-colors">
            How it Works
          </a>
          <a href="#security" className="text-sm text-gray-400 hover:text-white transition-colors">
            Security
          </a>
        </div>

        <motion.button
          onClick={onLaunchApp}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 rounded-full bg-white text-black text-sm transition-colors hover:bg-gray-100"
        >
          Launch App
        </motion.button>
      </div>
    </motion.nav>
  );
}
