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