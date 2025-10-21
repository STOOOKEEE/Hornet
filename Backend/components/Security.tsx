import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export function Security() {
  const smartContractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YieldVault is ReentrancyGuard, Ownable {
    IERC20 public immutable usdc;
    
    mapping(address => uint256) public shares;
    uint256 public totalShares;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        usdc.transferFrom(msg.sender, address(this), amount);
        shares[msg.sender] += amount;
        totalShares += amount;
        emit Deposit(msg.sender, amount);
    }
    
    function withdraw(uint256 amount) external nonReentrant {
        require(shares[msg.sender] >= amount, "Insufficient");
        shares[msg.sender] -= amount;
        totalShares -= amount;
        usdc.transfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount);
    }
}`;

  const protocols = [
    {
      name: "Moonwell",
      url: "https://moonwell.fi/",
    },
    {
      name: "Aerodrome",
      url: "https://aerodrome.finance/",
    },
    {
      name: "Chainlink",
      url: "https://chain.link/",
    },
  ];

  return (
    <div id="security" className="py-32 px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl text-white mb-6">Security First</h2>
          <p className="text-xl text-gray-500 max-w-2xl mb-20">
            Built with industry-leading standards and audited smart contracts
          </p>

          {/* Vertical Layout */}
          <div className="space-y-16">
            {/* Non-Custodial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl text-white mb-4">Non-Custodial</h3>
              <p className="text-gray-500 max-w-2xl">
                You maintain complete control of your funds. We never hold your assets.
              </p>
            </motion.div>

            {/* Open by Default Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl text-white mb-2">
                Open by default, secure by design
              </h3>
              <p className="text-sm text-gray-500 mb-6">see it yourself</p>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden">
                <div className="overflow-x-auto">
                  <pre className="text-xs text-gray-300 font-mono leading-relaxed">
                    <code>{smartContractCode}</code>
                  </pre>
                </div>
              </div>
            </motion.div>

            {/* Trusted Protocols */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl text-white mb-4">Trusted Protocols</h3>
              <p className="text-gray-500 mb-8 max-w-2xl">
                Hornet integrates only with established DeFi protocols on Base.
              </p>

              <div className="flex flex-wrap gap-3">
                {protocols.map((protocol) => (
                  <motion.a
                    key={protocol.name}
                    href={protocol.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full border border-white/10 text-gray-400 text-sm hover:border-white/30 hover:text-white transition-all flex items-center gap-2 group"
                  >
                    {protocol.name}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
