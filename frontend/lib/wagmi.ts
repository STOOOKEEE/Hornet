import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

// Get WalletConnect project ID from environment variable
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set');
}

export const config = createConfig({
  chains: [base],
  connectors: [
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Hornet',
        description: 'AI-powered yield optimization for USDC on Base',
        url: 'https://hornet.app',
        icons: ['https://hornet.app/logo.png']
      }
    }),
  ],
  transports: {
    [base.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
