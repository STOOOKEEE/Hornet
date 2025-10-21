import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Connect Wallet",
    description: "Link Coinbase Wallet or MetaMask",
  },
  {
    number: "02",
    title: "Deposit USDC",
    description: "Any amount, deployed automatically",
  },
  {
    number: "03",
    title: "AI Optimizes",
    description: "Continuous monitoring & suggestions",
  },
  {
    number: "04",
    title: "Earn",
    description: "Auto-compound, withdraw anytime",
  },
];

export function HowItWorks() {
  return (
    <div id="how" className="py-32 px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-5xl text-white mb-4">
            How it Works
          </h2>
          <p className="text-xl text-gray-500">
            Four simple steps to start earning
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-6xl mb-6 text-white/10">
                {step.number}
              </div>
              <h3 className="text-xl text-white mb-2">{step.title}</h3>
              <p className="text-gray-500">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
