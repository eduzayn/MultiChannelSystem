import React from 'react';
import { useLocation } from 'wouter';
import { Button } from './button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string; // Destino opcional para sobrescrever o comportamento padrão
  label?: string; // Texto opcional do botão
  className?: string; // Classes adicionais
}

export function BackButton({ to, label, className = '' }: BackButtonProps) {
  const [location, setLocation] = useLocation();
  
  const handleGoBack = () => {
    if (to) {
      // Se um destino específico foi fornecido, navegar para ele
      setLocation(to);
    } else if (window.history.length > 1) {
      // Se houver histórico, voltar para a página anterior
      window.history.back();
    } else {
      // Caso não haja histórico (ex: acesso direto à página), ir para a página inicial
      setLocation('/');
    }
  };

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