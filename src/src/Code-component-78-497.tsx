import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App'
import '../styles/globals.css'
import { performanceMonitor } from '../utils/performance'

// Iniciar monitoramento de performance
performanceMonitor.startTimer('pageLoad')

// Error boundary simples
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo)
    performanceMonitor.recordError()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-border/50 max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Ops! Algo deu errado 😕
            </h2>
            <p className="text-gray-600 mb-6">
              Recarregue a página para tentar novamente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bentin-button-primary"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)

// Finalizar monitoramento quando a página carregar
window.addEventListener('load', () => {
  performanceMonitor.endTimer('pageLoad')
  
  if (import.meta.env.DEV) {
    console.log(performanceMonitor.generateReport())
  }
})