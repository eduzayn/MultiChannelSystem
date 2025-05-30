/**
 * Utilitários para manipulação e prevenção de erros de DOM
 */

// Monitorar erros de DOM e inserção
export function setupDOMErrorMonitoring() {
  // Armazenar o método original
  const originalInsertBefore = Node.prototype.insertBefore;

  // Sobrescrever o método para adicionar verificações adicionais
  // @ts-ignore - Ignorando o erro de tipo para permitir a sobrescrita com tratamento de erro
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    try {
      // Verifica se o nó de referência é filho deste nó
      if (referenceNode && !this.contains(referenceNode)) {
        console.warn(
          'Tentativa de inserir um nó antes de um nó de referência que não é filho deste nó.', 
          {
            parentNode: this,
            newNode: newNode,
            referenceNode: referenceNode
          }
        );
        
        // Se houver um erro, inserir no final como fallback
        return this.appendChild(newNode);
      }
      
      // Comportamento normal
      return originalInsertBefore.call(this, newNode, referenceNode);
    } catch (error) {
      console.error('Erro em insertBefore:', error);
      
      // Tentar recuperar inserindo o nó no final
      try {
        return this.appendChild(newNode);
      } catch (appendError) {
        console.error('Falha no fallback appendChild:', appendError);
        throw error; // Re-lançar o erro original se o fallback falhar
      }
    }
  };

  // Monitora erros não tratados
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('insertBefore')) {
      console.error('Erro de DOM capturado:', event.error);
    }
  });

  // Retorna função para restaurar o comportamento original
  return function cleanup() {
    Node.prototype.insertBefore = originalInsertBefore;
  };
}

// Função de verificação de segurança de DOM
export function safeDOM(callback: () => void) {
  try {
    // Executa a operação dentro de um setTimeout para evitar 
    // conflitos no ciclo de renderização do React
    setTimeout(() => {
      try {
        callback();
      } catch (error) {
        console.error('Erro em operação de DOM:', error);
      }
    }, 0);
  } catch (error) {
    console.error('Erro ao agendar operação de DOM:', error);
  }
}

// Iniciar monitoramento de erros quando o módulo for importado
let cleanupFn: (() => void) | null = null;

// Iniciar apenas no navegador
if (typeof window !== 'undefined') {
  cleanupFn = setupDOMErrorMonitoring();
}

// Exportar função de limpeza para uso em testes ou desativação
export function cleanupDOMErrorMonitoring() {
  if (cleanupFn) {
    cleanupFn();
    cleanupFn = null;
  }
} 