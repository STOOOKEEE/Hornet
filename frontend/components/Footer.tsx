import { motion } from "framer-motion";
import { Twitter, Github, MessageCircle } from "lucide-react";
import Image from 'next/image';
import Hornet from '../styles/Hornet.png';

export function Footer() {
  return (
    <footer className="py-20 px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center relative">
                <Image
                  src={Hornet}
                  alt="Hornet Logo"
                  layout="fill"
                  objectFit="cover"
                  className="object-center"
                />
              </div>
              <span className="text-xl text-white">Hornet</span>
            </div>
            <p className="text-gray-500 mb-8 max-w-sm">
              Automated yield optimization for USDC on Base
            </p>
            <div className="flex items-center gap-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </motion.a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#features" className="text-gray-500 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how" className="text-gray-500 hover:text-white transition-colors">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#premium" className="text-gray-500 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-gray-500 hover:text-white transition-colors">
                    Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-white transition-colors">
                    Contracts
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-white transition-colors">
                    Audits
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2025 Hornet. Built on Base.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
