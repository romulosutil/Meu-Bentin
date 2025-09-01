import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App'
import '../styles/globals.css'

// Error boundary otimizado
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-border/50 max-w-md">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Ops! Algo deu errado
            </h2>
            <p className="text-gray-600 mb-6">
              Recarregue a página para tentar novamente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bentin-button-primary"
            >
              🔄 Recarregar Página
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Detalhes do erro
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Render principal
const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)

// Log de inicialização
console.log('🏪 Meu Bentin - Sistema iniciado com sucesso!')
console.log('🎨 Framework: React + TypeScript + Tailwind v4')