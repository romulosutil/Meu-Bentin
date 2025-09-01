import type { AppProps } from 'next/app'
import '../styles/globals.css'

// Next.js App Component - Wrapper global
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}