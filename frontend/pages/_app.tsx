import '../index.css';
import type { AppProps } from 'next/app';
import { Web3ModalProvider } from '../components/providers/Web3ModalProvider';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3ModalProvider>
      <Component {...pageProps} />
    </Web3ModalProvider>
  );
}
