/**
 * Utilitários robustos para cópia de texto ao clipboard
 * Funciona mesmo quando a Clipboard API está bloqueada
 */

export interface CopyResult {
  success: boolean;
  method?: 'clipboard' | 'execCommand' | 'manual';
  error?: string;
}

// Cache para evitar verificações repetidas
let clipboardAPIStatus: boolean | null = null;
let clipboardAPIChecked = false;

/**
 * Inicializa a verificação de clipboard antecipadamente
 * Útil para chamar na inicialização da aplicação
 */
export async function initializeClipboard(): Promise<void> {
  try {
    await isClipboardAPIAvailable();
  } catch {
    // Ignorar erros na inicialização
  }
}

/**
 * Reset do cache (útil para testes ou mudanças de contexto)
 */
export function resetClipboardCache(): void {
  clipboardAPIStatus = null;
  clipboardAPIChecked = false;
}

/**
 * Copia texto para o clipboard usando múltiplas estratégias de fallback
 */
export async function copyToClipboard(text: string): Promise<CopyResult> {
  // Estratégia 1: Clipboard API moderna (apenas se pré-verificada como disponível)
  const clipboardAvailable = await isClipboardAPIAvailable();
  
  if (clipboardAvailable) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard' };
    } catch (error) {
      // Se falhou mesmo com pré-verificação, marcar como indisponível
      clipboardAPIStatus = false;
      // Não logar - já sabemos que pode falhar
    }
  }

  // Estratégia 2: document.execCommand (fallback silencioso)
  try {
    return execCommandCopy(text);
  } catch (error) {
    // Não logar - execCommand pode falhar em muitos contextos modernos
  }

  // Estratégia 3: Falha - retornar erro para mostrar opção manual
  return {
    success: false,
    error: 'Clipboard não disponível. Use Ctrl+C (ou Cmd+C no Mac) para copiar o texto selecionado.'
  };
}

/**
 * Versão simplificada que vai direto para o fallback manual
 * Útil quando sabemos que o clipboard não funciona
 */
export function copyToClipboardSimple(text: string): CopyResult {
  try {
    return execCommandCopy(text);
  } catch {
    return {
      success: false,
      method: 'manual',
      error: 'Use Ctrl+C (ou Cmd+C no Mac) para copiar o texto selecionado.'
    };
  }
}

/**
 * Implementação de fallback usando document.execCommand
 */
function execCommandCopy(text: string): CopyResult {
  // Criar elemento temporário invisível
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Configurar para ser invisível mas focalizável
  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  textArea.style.left = '-9999px';
  textArea.style.opacity = '0';
  textArea.style.pointerEvents = 'none';
  textArea.setAttribute('readonly', '');
  
  // Adicionar ao DOM
  document.body.appendChild(textArea);
  
  try {
    // Selecionar o texto
    textArea.select();
    textArea.setSelectionRange(0, text.length);
    
    // Tentar copiar
    const successful = document.execCommand('copy');
    
    if (successful) {
      return { success: true, method: 'execCommand' };
    } else {
      throw new Error('execCommand returned false');
    }
  } finally {
    // Sempre remover o elemento temporário
    document.body.removeChild(textArea);
  }
}

/**
 * Verifica se a Clipboard API está realmente disponível e não bloqueada
 */
export async function isClipboardAPIAvailable(): Promise<boolean> {
  // Retornar cache se já verificou
  if (clipboardAPIChecked) {
    return clipboardAPIStatus || false;
  }

  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    clipboardAPIStatus = false;
    clipboardAPIChecked = true;
    return false;
  }

  try {
    // Tentar verificar permissões primeiro
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
        if (permission.state === 'denied') {
          clipboardAPIStatus = false;
          clipboardAPIChecked = true;
          return false;
        }
      } catch {
        // Ignorar erro de permissions.query se não suportado
      }
    }

    // Teste rápido com string vazia (menos intrusivo)
    await navigator.clipboard.writeText('');
    clipboardAPIStatus = true;
    clipboardAPIChecked = true;
    return true;
  } catch (error) {
    // Se falhou no teste, a API provavelmente está bloqueada
    clipboardAPIStatus = false;
    clipboardAPIChecked = true;
    return false;
  }
}

/**
 * Verifica se a funcionalidade de clipboard está disponível (síncrono)
 */
export function isClipboardSupported(): boolean {
  return !!(
    (navigator.clipboard && navigator.clipboard.writeText) ||
    document.execCommand
  );
}

/**
 * Verifica se o erro é relacionado a permissões bloqueadas
 */
function isPermissionError(error: any): boolean {
  return error && (
    error.name === 'NotAllowedError' ||
    error.message?.includes('clipboard') ||
    error.message?.includes('permissions policy') ||
    error.message?.includes('blocked')
  );
}

/**
 * Verifica se o erro é relacionado a questões de segurança
 */
function isSecurityError(error: any): boolean {
  return error && (
    error.name === 'SecurityError' ||
    error.message?.includes('security') ||
    error.message?.includes('permission')
  );
}

/**
 * Seleciona texto em um elemento para cópia manual
 */
export function selectText(element: HTMLElement): void {
  const selection = window.getSelection();
  const range = document.createRange();
  
  if (selection && range) {
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

/**
 * Cria um elemento temporário com o texto e o seleciona para cópia manual
 */
export function selectTextForManualCopy(text: string): HTMLElement {
  // Verificar se já existe uma modal aberta
  const existing = document.querySelector('.clipboard-modal');
  if (existing) {
    existing.remove();
  }

  const container = document.createElement('div');
  container.className = 'clipboard-modal';
  container.style.position = 'fixed';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.zIndex = '9999';
  container.style.background = 'white';
  container.style.border = '2px solid #e91e63';
  container.style.borderRadius = '12px';
  container.style.padding = '20px';
  container.style.maxWidth = '90vw';
  container.style.maxHeight = '80vh';
  container.style.overflow = 'auto';
  container.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
  container.style.animation = 'fadeIn 0.2s ease-out';
  
  // Overlay para fechar clicando fora
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0, 0, 0, 0.3)';
  overlay.style.zIndex = '9998';
  overlay.onclick = () => {
    document.body.removeChild(overlay);
    document.body.removeChild(container);
  };
  
  const title = document.createElement('h3');
  title.textContent = '📋 Copiar texto manualmente';
  title.style.marginBottom = '12px';
  title.style.color = '#e91e63';
  title.style.fontSize = '16px';
  title.style.fontWeight = '600';
  
  const instruction = document.createElement('p');
  instruction.textContent = 'O texto foi selecionado automaticamente. Use Ctrl+C (ou Cmd+C no Mac) para copiar.';
  instruction.style.marginBottom = '15px';
  instruction.style.color = '#64748b';
  instruction.style.fontSize = '14px';
  
  const textElement = document.createElement('pre');
  textElement.textContent = text;
  textElement.style.background = '#f8f9fa';
  textElement.style.padding = '12px';
  textElement.style.borderRadius = '8px';
  textElement.style.border = '1px solid #e2e8f0';
  textElement.style.fontSize = '12px';
  textElement.style.lineHeight = '1.4';
  textElement.style.whiteSpace = 'pre-wrap';
  textElement.style.userSelect = 'all';
  textElement.style.cursor = 'text';
  textElement.style.maxHeight = '200px';
  textElement.style.overflow = 'auto';
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.marginTop = '15px';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '10px';
  buttonContainer.style.justifyContent = 'flex-end';
  
  const copyAgainButton = document.createElement('button');
  copyAgainButton.textContent = 'Selecionar novamente';
  copyAgainButton.style.padding = '8px 16px';
  copyAgainButton.style.background = '#f1f5f9';
  copyAgainButton.style.color = '#475569';
  copyAgainButton.style.border = '1px solid #e2e8f0';
  copyAgainButton.style.borderRadius = '6px';
  copyAgainButton.style.cursor = 'pointer';
  copyAgainButton.style.fontSize = '14px';
  copyAgainButton.onclick = () => selectText(textElement);
  
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Fechar';
  closeButton.style.padding = '8px 16px';
  closeButton.style.background = '#e91e63';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '6px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '14px';
  
  const cleanup = () => {
    if (document.body.contains(overlay)) document.body.removeChild(overlay);
    if (document.body.contains(container)) document.body.removeChild(container);
  };
  
  closeButton.onclick = cleanup;
  
  // Fechar com ESC
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      cleanup();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  buttonContainer.appendChild(copyAgainButton);
  buttonContainer.appendChild(closeButton);
  
  container.appendChild(title);
  container.appendChild(instruction);
  container.appendChild(textElement);
  container.appendChild(buttonContainer);
  
  // Adicionar CSS de animação se não existir
  if (!document.querySelector('#clipboard-animations')) {
    const style = document.createElement('style');
    style.id = 'clipboard-animations';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(overlay);
  document.body.appendChild(container);
  
  // Selecionar automaticamente o texto após um pequeno delay
  setTimeout(() => selectText(textElement), 100);
  
  return container;
}