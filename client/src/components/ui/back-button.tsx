import React, { useEffect, useState } from 'react';
import { Button } from './button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string; // Destino opcional para sobrescrever o comportamento padrão
  label?: string; // Texto opcional do botão
  className?: string; // Classes adicionais
}

export function BackButton({ to, label, className = '' }: BackButtonProps) {
  // Estado para controlar se o botão deve ser exibido
  const [showButton, setShowButton] = useState(false);
  
  // Verificar se estamos na página inicial ou se temos histórico
  useEffect(() => {
    const isHomePage = window.location.pathname === '/' || 
                       window.location.pathname === '' ||
                       window.location.pathname === '/index.html';
    
    // Mostrar o botão apenas se não estamos na home e temos histórico
    setShowButton(!isHomePage && window.history.length > 1);
  }, []);
  
  const handleGoBack = () => {
    if (to) {
      // Se um destino específico foi fornecido, navegar para ele
      window.location.href = to;
    } else if (window.history.length > 1) {
      // Se houver histórico, voltar para a página anterior
      window.history.back();
    } else {
      // Caso não haja histórico (ex: acesso direto à página), ir para a página inicial
      window.location.href = '/';
    }
  };

  // Não renderiza nada se o botão não deve ser exibido
  if (!showButton) {
    return null;
  }
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleGoBack}
      className={`flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors ${className}`}
      aria-label="Voltar"
    >
      <ArrowLeft className="h-4 w-4" />
      {label && <span>{label}</span>}
    </Button>
  );
}