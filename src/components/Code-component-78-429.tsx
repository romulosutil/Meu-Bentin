// =====================================================
// COMPONENTE DE DEBUG DO SISTEMA DE CLIENTES
// =====================================================
// Componente para diagnóstico e correção do sistema
// de clientes em tempo real
// =====================================================

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Server,
  Users,
  Baby,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import {
  projectId,
  publicAnonKey,
} from "../utils/supabase/info";

interface VerificacaoResult {
  tabela: string;
  existe: boolean;
  totalRegistros: number;
  observacoes: string;
  erro?: string;
}

interface DiagnosticoData {
  status: "ok" | "warning" | "error";
  resultados: VerificacaoResult[];
  resumo: string;
}

export default function DebugSistemaClientes() {
  const [diagnostico, setDiagnostico] =
    useState<DiagnosticoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f57293e2`;

  const executarDiagnostico = async () => {
    setIsLoading(true);

    try {
      console.log(
        "🔍 Executando diagnóstico do sistema de clientes...",
      );

      const resultados: VerificacaoResult[] = [];

      // 1. Verificar servidor
      try {
        const healthResponse = await fetch(
          `${BASE_URL}/health`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          },
        );

        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          resultados.push({
            tabela: "servidor",
            existe: true,
            totalRegistros: 1,
            observacoes: `Status: ${healthData.status}`,
          });
        } else {
          resultados.push({
            tabela: "servidor",
            existe: false,
            totalRegistros: 0,
            observacoes: "Servidor não responde",
            erro: `HTTP ${healthResponse.status}`,
          });
        }
      } catch (err) {
        resultados.push({
          tabela: "servidor",
          existe: false,
          totalRegistros: 0,
          observacoes: "Erro de conexão",
          erro:
            err instanceof Error
              ? err.message
              : "Erro desconhecido",
        });
      }

      // 2. Verificar clientes
      try {
        const clientesResponse = await fetch(
          `${BASE_URL}/clientes`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          },
        );

        if (clientesResponse.ok) {
          const clientesData = await clientesResponse.json();
          resultados.push({
            tabela: "clientes",
            existe: true,
            totalRegistros: clientesData.clientes?.length || 0,
            observacoes:
              clientesData.clientes?.length === 0
                ? "Tabela vazia"
                : "Funcionando",
          });
        } else {
          const errorData = await clientesResponse
            .json()
            .catch(() => ({}));
          resultados.push({
            tabela: "clientes",
            existe: false,
            totalRegistros: 0,
            observacoes: "Erro na API",
            erro:
              errorData.error ||
              `HTTP ${clientesResponse.status}`,
          });
        }
      } catch (err) {
        resultados.push({
          tabela: "clientes",
          existe: false,
          totalRegistros: 0,
          observacoes: "Erro de conexão",
          erro:
            err instanceof Error
              ? err.message
              : "Erro desconhecido",
        });
      }

      // 3. Verificar estatísticas
      try {
        const statsResponse = await fetch(
          `${BASE_URL}/clientes/stats`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          },
        );

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          resultados.push({
            tabela: "estatísticas",
            existe: true,
            totalRegistros: 1,
            observacoes: `${statsData.stats?.totalClientes || 0} clientes, ${statsData.stats?.totalFilhos || 0} filhos`,
          });
        } else {
          const errorData = await statsResponse
            .json()
            .catch(() => ({}));
          resultados.push({
            tabela: "estatísticas",
            existe: false,
            totalRegistros: 0,
            observacoes: "Erro na API de stats",
            erro:
              errorData.error || `HTTP ${statsResponse.status}`,
          });
        }
      } catch (err) {
        resultados.push({
          tabela: "estatísticas",
          existe: false,
          totalRegistros: 0,
          observacoes: "Erro de conexão",
          erro:
            err instanceof Error
              ? err.message
              : "Erro desconhecido",
        });
      }

      // 4. Verificar teste específico do sistema de clientes
      try {
        const testResponse = await fetch(
          `${BASE_URL}/clientes/test`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          },
        );

        if (testResponse.ok) {
          const testData = await testResponse.json();
          const summary = testData.summary;
          resultados.push({
            tabela: "teste-sistema",
            existe: summary.status !== "all_failed",
            totalRegistros: summary.passed,
            observacoes: `${summary.passed}/${summary.total} testes passaram - Status: ${summary.status}`,
          });
        } else {
          resultados.push({
            tabela: "teste-sistema",
            existe: false,
            totalRegistros: 0,
            observacoes: "Teste do sistema falhou",
            erro: `HTTP ${testResponse.status}`,
          });
        }
      } catch (err) {
        resultados.push({
          tabela: "teste-sistema",
          existe: false,
          totalRegistros: 0,
          observacoes: "Erro no teste do sistema",
          erro:
            err instanceof Error
              ? err.message
              : "Erro desconhecido",
        });
      }

      // Determinar status geral
      const errors = resultados.filter(
        (r) => !r.existe && r.erro,
      ).length;
      const warnings = resultados.filter(
        (r) => r.existe && r.totalRegistros === 0,
      ).length;

      let status: "ok" | "warning" | "error";
      let resumo: string;

      if (errors > 0) {
        status = "error";
        resumo = `${errors} erros críticos encontrados`;
      } else if (warnings > 0) {
        status = "warning";
        resumo = `${warnings} componentes precisam de atenção`;
      } else {
        status = "ok";
        resumo = "Sistema funcionando corretamente";
      }

      setDiagnostico({ status, resultados, resumo });
      setLastCheck(new Date());
    } catch (err) {
      console.error("Erro no diagnóstico:", err);
      setDiagnostico({
        status: "error",
        resultados: [
          {
            tabela: "diagnóstico",
            existe: false,
            totalRegistros: 0,
            observacoes: "Falha no diagnóstico",
            erro:
              err instanceof Error
                ? err.message
                : "Erro desconhecido",
          },
        ],
        resumo: "Falha ao executar diagnóstico",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (existe: boolean, erro?: string) => {
    if (erro)
      return <XCircle className="h-5 w-5 text-red-600" />;
    if (existe)
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    return (
      <AlertTriangle className="h-5 w-5 text-yellow-600" />
    );
  };

  const getStatusColor = (existe: boolean, erro?: string) => {
    if (erro) return "destructive";
    if (existe) return "default";
    return "secondary";
  };

  const getComponentIcon = (tabela: string) => {
    switch (tabela) {
      case "servidor":
        return <Server className="h-4 w-4" />;
      case "clientes":
        return <Users className="h-4 w-4" />;
      case "filhos":
        return <Baby className="h-4 w-4" />;
      case "estatísticas":
        return <Database className="h-4 w-4" />;
      case "vendas.cliente_id":
        return <ShoppingCart className="h-4 w-4" />;
      case "teste-sistema":
        return <Wrench className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    executarDiagnostico();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-6 w-6 text-bentin-blue" />
              Debug - Sistema de Clientes
            </CardTitle>
            <CardDescription>
              Diagnóstico e verificação do sistema de clientes
              em tempo real
            </CardDescription>
          </div>
          <Button
            onClick={executarDiagnostico}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Verificar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Geral */}
        {diagnostico && (
          <Alert
            variant={
              diagnostico.status === "error"
                ? "destructive"
                : "default"
            }
          >
            <div className="flex items-center gap-2">
              {diagnostico.status === "ok" && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {diagnostico.status === "warning" && (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              {diagnostico.status === "error" && (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-semibold">
                Status: {diagnostico.status.toUpperCase()}
              </span>
            </div>
            <AlertDescription className="mt-2">
              {diagnostico.resumo}
            </AlertDescription>
          </Alert>
        )}

        {/* Última Verificação */}
        {lastCheck && (
          <div className="text-sm text-gray-500 text-center">
            Última verificação:{" "}
            {lastCheck.toLocaleString("pt-BR")}
          </div>
        )}

        <Separator />

        {/* Resultados Detalhados */}
        {diagnostico && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Componentes do Sistema
            </h3>

            <div className="grid gap-4">
              {diagnostico.resultados.map(
                (resultado, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getComponentIcon(resultado.tabela)}
                          <div>
                            <h4 className="font-medium capitalize">
                              {resultado.tabela}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {resultado.observacoes}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {resultado.totalRegistros > 0 && (
                            <Badge variant="outline">
                              {resultado.totalRegistros}{" "}
                              registros
                            </Badge>
                          )}

                          <div className="flex items-center gap-2">
                            {getStatusIcon(
                              resultado.existe,
                              resultado.erro,
                            )}
                            <Badge
                              variant={getStatusColor(
                                resultado.existe,
                                resultado.erro,
                              )}
                            >
                              {resultado.existe ? "OK" : "ERRO"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {resultado.erro && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <strong>Erro:</strong>{" "}
                          {resultado.erro}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </div>
        )}

        {/* Informações Técnicas */}
        <Separator />

        <div className="space-y-2 text-sm text-gray-600">
          <h4 className="font-medium">Informações Técnicas:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              Project ID:{" "}
              <code className="bg-gray-100 px-1 rounded">
                {projectId}
              </code>
            </div>
            <div>
              Endpoint:{" "}
              <code className="bg-gray-100 px-1 rounded">
                {BASE_URL}
              </code>
            </div>
          </div>
        </div>

        {/* Instruções de Correção */}
        {diagnostico && diagnostico.status !== "ok" && (
          <>
            <Separator />
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Como corrigir:</strong>
                <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                  <li>
                    Execute as migrações SQL no Supabase SQL
                    Editor
                  </li>
                  <li>
                    Verifique se as tabelas 'clientes' e
                    'filhos' existem
                  </li>
                  <li>
                    Confirme se a coluna 'cliente_id' foi
                    adicionada à tabela 'vendas'
                  </li>
                  <li>
                    Verifique se o servidor Edge Function está
                    deployado
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}