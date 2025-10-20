# Hornet - AI-Powered Yield Optimization

AI-powered yield optimization for USDC on Base blockchain.

## Features

- 🔗 Wallet Connection (Coinbase Wallet & MetaMask)
- 💰 Deposit & Withdraw USDC
- 🤖 AI-Powered Yield Optimization
- 📊 Performance Metrics & Analytics
- 🔄 Auto-Rebalancing
- 🔒 Secure Smart Contracts

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui + Radix UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Web3**: Wagmi + Viem
- **Wallet Connection**: WalletConnect, Coinbase Wallet, MetaMask

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd Hornest
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env.local
```
Then edit `.env.local` and add your WalletConnect Project ID (get one at https://cloud.walletconnect.com/)

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
Hornest/
├── pages/              # Next.js pages
│   ├── _app.tsx       # App wrapper
│   ├── _document.tsx  # Document wrapper
│   ├── index.tsx      # Landing page
│   └── dashboard.tsx  # Dashboard page
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── dashboard/     # Dashboard-specific components
│   ├── LoadingAnimation.tsx
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── AIOptimization.tsx
│   ├── HowItWorks.tsx
│   ├── Security.tsx
│   ├── Navbar.tsx
│   └── Footer.tsx
├── lib/               # Utility functions
├── styles/            # Global styles
└── public/            # Static assets

```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Configuration

The project uses:
- **next.config.js** - Next.js configuration
- **tsconfig.json** - TypeScript configuration
- **tailwind.config.js** - TailwindCSS configuration
- **postcss.config.js** - PostCSS configuration

## License

MIT

## Built on Base

This project is built on the Base blockchain for fast and secure transactions.
