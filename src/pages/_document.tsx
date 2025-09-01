import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Sistema completo de gestão para loja infantil Meu Bentin" />
        <meta name="keywords" content="gestão, estoque, vendas, loja infantil, meu bentin" />
        <meta name="author" content="Meu Bentin" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Preload de fonts se necessário */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Meta tags para PWA se necessário */}
        <meta name="theme-color" content="#e91e63" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Meu Bentin" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}