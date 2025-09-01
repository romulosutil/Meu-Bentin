import type { NextPage } from 'next'
import Head from 'next/head'

// Importar o componente App existente
import App from '../App'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Meu Bentin - Sistema de Gestão</title>
        <meta name="description" content="Sistema completo de gestão para loja infantil Meu Bentin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      {/* Usar o componente App existente */}
      <App />
    </>
  )
}

export default Home