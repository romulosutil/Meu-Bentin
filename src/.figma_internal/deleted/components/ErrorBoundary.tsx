/**
 * Error Boundary para capturar erros do Supabase e outros erros críticos
 */

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Verificar se é um erro do Supabase/Ambiente
      const isSupabaseError = this.state.error?.message?.includes('VITE_SUPABASE') || 
                             this.state.error?.message?.includes('Supabase') ||
                             this.state.error?.message?.includes('createClient');

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full space-y-6">
            
            {/* Logo/Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-bentin-pink via-bentin-blue to-bentin-green bg-clip-text text-transparent">
                Meu Bentin
              </h1>
              <p className="text-muted-foreground mt-2">Sistema de Gestão</p>
            </div>

            {/* Erro Principal */}
            <Alert className="border-destructive/50 bg-destructive/5">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>Ops! Algo deu errado</strong>
                <br />
                {isSupabaseError ? 
                  'Erro na conexão com o banco de dados. Verifique as configurações do Supabase.' :
                  'Ocorreu um erro inesperado no sistema.'
                }
              </AlertDescription>
            </Alert>

            {/* Detalhes do Erro (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="bg-muted p-4 rounded-lg text-sm">
                <summary className="cursor-pointer font-medium mb-2">
                  Detalhes técnicos (desenvolvimento)
                </summary>
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  {this.state.error?.message}
                  {this.state.error?.stack && '\n\nStack trace:\n' + this.state.error.stack}
                </pre>
              </details>
            )}

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={this.handleReset}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
              
              <Button 
                onClick={this.handleReload}
                className="flex-1 bg-bentin-pink hover:bg-bentin-pink/85"
              >
                Recarregar Página
              </Button>
            </div>

            {/* Dicas */}
            {isSupabaseError && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <h4 className="font-medium text-blue-900 mb-2">💡 Como resolver:</h4>
                <ul className="text-blue-800 space-y-1 list-disc list-inside">
                  <li>Verifique se o arquivo <code>.env</code> existe na raiz do projeto</li>
                  <li>Confirme se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas</li>
                  <li>Reinicie o servidor de desenvolvimento após editar o .env</li>
                  <li>Verifique se a URL do Supabase está correta</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar o ErrorBoundary de forma mais simples
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}