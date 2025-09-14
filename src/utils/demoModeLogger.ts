/**
 * Sistema centralizado de logs para modo demonstração
 * Controla quando mostrar warnings e logs relacionados ao banco não configurado
 */

interface LogState {
  isDemoMode: boolean;
  hasLoggedDemoMode: boolean;
  suppressWarnings: boolean;
}

class DemoModeLogger {
  private state: LogState = {
    isDemoMode: false,
    hasLoggedDemoMode: false,
    suppressWarnings: false
  };

  private tablesChecked = new Set<string>();

  activateDemoMode(reason: 'tables_missing' | 'connection_error') {
    this.state.isDemoMode = true;
    
    if (!this.state.hasLoggedDemoMode) {
      console.log('🔄 Sistema Meu Bentin em Modo Demonstração');
      console.log(`   Motivo: ${reason === 'tables_missing' ? 'Tabelas do banco não criadas' : 'Erro de conexão'}`);
      console.log('   📝 Dados de exemplo sendo utilizados');
      console.log('   ⚠️  Para funcionalidade completa, configure o banco Supabase');
      
      this.state.hasLoggedDemoMode = true;
      
      // Suprimir warnings após 5 segundos para não poluir o console
      setTimeout(() => {
        this.state.suppressWarnings = true;
      }, 5000);
    }
  }

  logTableNotFound(tableName: string, isError = false) {
    if (this.state.suppressWarnings) {
      return;
    }

    if (!this.tablesChecked.has(tableName)) {
      if (isError) {
        console.warn(`⚠️ Tabela ${tableName} não encontrada, usando dados de exemplo`);
      } else {
        console.log(`📊 Tabela ${tableName}: modo demonstração ativo`);
      }
      this.tablesChecked.add(tableName);
    }
  }

  logDemoOperation(operation: string, entity: string) {
    if (this.state.suppressWarnings) {
      return;
    }
    
    if (this.state.isDemoMode) {
      console.log(`🔄 [Demo] ${operation} ${entity} - simulado com sucesso`);
    }
  }

  shouldShowVerboseLogs(): boolean {
    return !this.state.suppressWarnings && this.state.isDemoMode;
  }

  isDemoModeActive(): boolean {
    return this.state.isDemoMode;
  }

  reset() {
    this.state = {
      isDemoMode: false,
      hasLoggedDemoMode: false,
      suppressWarnings: false
    };
    this.tablesChecked.clear();
  }

  // Método para logs condicionais
  conditionalLog(message: string, type: 'log' | 'warn' | 'error' = 'log') {
    if (this.shouldShowVerboseLogs()) {
      console[type](message);
    }
  }

  // Log de estatísticas finais do modo demo
  logDemoStats() {
    if (this.state.isDemoMode && !this.state.suppressWarnings) {
      console.log('📊 Estatísticas do Modo Demo:');
      console.log(`   Tabelas verificadas: ${this.tablesChecked.size}`);
      console.log(`   Logs suprimidos: ${this.state.suppressWarnings ? 'Sim' : 'Não'}`);
    }
  }

  // Método de error compatível com console.error
  error(message: string, error?: any) {
    if (error) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  }
}

// Instância singleton
export const demoLogger = new DemoModeLogger();

// Helper functions para uso fácil
export const logTableNotFound = (tableName: string, isError = false) => {
  demoLogger.logTableNotFound(tableName, isError);
};

export const logDemoOperation = (operation: string, entity: string) => {
  demoLogger.logDemoOperation(operation, entity);
};

export const activateDemoMode = (reason: 'tables_missing' | 'connection_error') => {
  demoLogger.activateDemoMode(reason);
};

export const isDemoModeActive = () => {
  return demoLogger.isDemoModeActive();
};

export const conditionalLog = (message: string, type: 'log' | 'warn' | 'error' = 'log') => {
  demoLogger.conditionalLog(message, type);
};

// Função para retornar dados de demonstração
export function getDemoData() {
  return {
    produtos: [
      {
        id: 'demo-1',
        nome: 'Camiseta Infantil Rosa',
        categoria: 'Roupas',
        preco: 29.90,
        precoCusto: 15.00,
        quantidade: 25,
        estoqueMinimo: 5,
        dataAtualizacao: new Date().toISOString(),
        ativo: true,
        marca: 'Meu Bentin',
        genero: 'unissex'
      },
      {
        id: 'demo-2',
        nome: 'Short Jeans Azul',
        categoria: 'Roupas',
        preco: 39.90,
        precoCusto: 20.00,
        quantidade: 15,
        estoqueMinimo: 5,
        dataAtualizacao: new Date().toISOString(),
        ativo: true,
        marca: 'Meu Bentin',
        genero: 'unissex'
      },
      {
        id: 'demo-3',
        nome: 'Tênis Infantil Verde',
        categoria: 'Calçados',
        preco: 79.90,
        precoCusto: 45.00,
        quantidade: 8,
        estoqueMinimo: 3,
        dataAtualizacao: new Date().toISOString(),
        ativo: true,
        marca: 'Meu Bentin',
        genero: 'unissex'
      }
    ],
    vendas: [
      {
        id: 'demo-venda-1',
        produtoId: 'demo-1',
        nomeProduto: 'Camiseta Infantil Rosa',
        quantidade: 2,
        precoUnitario: 29.90,
        precoTotal: 59.80,
        vendedor: 'Venda Direta',
        categoria: 'Roupas',
        formaPagamento: 'pix' as const,
        desconto: 0,
        data: new Date(Date.now() - 86400000).toISOString(), // ontem
        cliente: 'Cliente Demo',
        cliente_id: 'demo-cliente-1'
      },
      {
        id: 'demo-venda-2',
        produtoId: 'demo-2',
        nomeProduto: 'Short Jeans Azul',
        quantidade: 1,
        precoUnitario: 39.90,
        precoTotal: 39.90,
        vendedor: 'Venda Direta',
        categoria: 'Roupas',
        formaPagamento: 'dinheiro' as const,
        desconto: 0,
        data: new Date().toISOString(),
        cliente: 'Cliente Demo 2',
        cliente_id: 'demo-cliente-2'
      }
    ],
    categorias: ['Roupas', 'Calçados', 'Acessórios', 'Brinquedos'],
    metas: [
      {
        id: 'demo-meta-1',
        mes: 'Dezembro',
        ano: 2024,
        valorMeta: 5000,
        vendedor: 'Loja',
        ativa: true,
        titulo: 'Meta de Dezembro 2024'
      }
    ]
  };
}