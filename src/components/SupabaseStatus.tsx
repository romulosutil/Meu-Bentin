import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Cloud,
  Monitor,
  Wifi,
  WifiOff
} from 'lucide-react';
import { isDevelopment } from '../utils/env';

// Mock para build sem Supabase
const storage = {
  getIntegrationStatus: async () => ({
    integrated: false,
    connected: false,
    usingSupabase: false,
    connectionTest: { message: 'Build mode - localStorage only' }
  })
};

const isSupabaseIntegrated = false;
const projectId = 'local';

interface IntegrationStatus {
  integrated: boolean;
  connected: boolean;
  usingSupabase: boolean;
  connectionTest?: any;
}

export default function SupabaseStatus() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const statusResult = await storage.getIntegrationStatus();
      setStatus(statusResult);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setStatus({
        integrated: false,
        connected: false,
        usingSupabase: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (!status?.integrated) return <Monitor className="h-4 w-4 text-icon-gray" />;
    if (status.connected && status.usingSupabase) return <CheckCircle className="h-4 w-4 text-icon-green" />;
    if (status.integrated && !status.connected) return <AlertTriangle className="h-4 w-4 text-icon-orange" />;
    return <XCircle className="h-4 w-4 text-icon-red" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Verificando...';
    if (!status?.integrated) return 'Local (localStorage)';
    if (status.connected && status.usingSupabase) return 'Conectado (Supabase)';
    if (status.integrated && !status.connected) return 'Integrado (sem conexão)';
    return 'Erro de configuração';
  };

  const getStatusBadge = () => {
    if (!status?.integrated) {
      return <Badge variant="outline" className="text-slate-600 border-slate-300">Local</Badge>;
    }
    if (status.connected && status.usingSupabase) {
      return <Badge className="bg-green-100 text-green-700 border-green-300">Online</Badge>;
    }
    if (status.integrated && !status.connected) {
      return <Badge variant="outline" className="text-orange-600 border-orange-300">Integrado</Badge>;
    }
    return <Badge variant="destructive">Erro</Badge>;
  };

  // Componente compacto para o Dashboard
  if (!isDevelopment()) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {status?.usingSupabase ? (
          <div className="flex items-center gap-1">
            <Wifi className="h-3 w-3 text-green-600" />
            <span>Sincronizado</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <WifiOff className="h-3 w-3 text-slate-500" />
            <span>Local</span>
          </div>
        )}
      </div>
    );
  }

  // Componente completo para desenvolvimento
  return (
    <Card className="bg-white border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-4 w-4 text-bentin-blue" />
          Status da Integração
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">{getStatusText()}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkStatus}
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Detalhes da configuração */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Integração Vercel:</span>
            <div className="flex items-center gap-1">
              {isSupabaseIntegrated ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <XCircle className="h-3 w-3 text-slate-400" />
              )}
              <span>{isSupabaseIntegrated ? 'Ativa' : 'Não detectada'}</span>
            </div>
          </div>

          {isSupabaseIntegrated && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Projeto ID:</span>
                <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                  {projectId !== 'local' ? projectId : 'Não configurado'}
                </code>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Conexão:</span>
                <div className="flex items-center gap-1">
                  {status?.connected ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                  )}
                  <span>{status?.connected ? 'Ativa' : 'Inativa'}</span>
                </div>
              </div>

              {status?.connectionTest?.details?.responseTime && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Latência:</span>
                  <span className="text-green-600 font-mono text-xs">
                    {status.connectionTest.details.responseTime}ms
                  </span>
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Storage ativo:</span>
            <div className="flex items-center gap-1">
              {status?.usingSupabase ? (
                <Cloud className="h-3 w-3 text-blue-600" />
              ) : (
                <Monitor className="h-3 w-3 text-slate-600" />
              )}
              <span>{status?.usingSupabase ? 'Supabase' : 'localStorage'}</span>
            </div>
          </div>
        </div>

        {/* Timestamp da última verificação */}
        {lastChecked && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Última verificação: {lastChecked.toLocaleTimeString()}
          </div>
        )}

        {/* Informações úteis */}
        {!isSupabaseIntegrated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p className="text-sm text-blue-700 mb-1 font-medium">
              💡 Integração Vercel-Supabase disponível
            </p>
            <p className="text-xs text-blue-600">
              Configure a integração no dashboard da Vercel para sincronização automática na nuvem.
            </p>
          </div>
        )}

        {isSupabaseIntegrated && !status?.connected && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
            <p className="text-sm text-orange-700 mb-1 font-medium">
              ⚠️ Integração detectada mas sem conexão
            </p>
            <p className="text-xs text-orange-600">
              Verifique as configurações de rede ou aguarde alguns minutos para estabilizar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}