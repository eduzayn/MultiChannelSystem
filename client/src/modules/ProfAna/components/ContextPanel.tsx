import { Conversation } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Info, LayoutList } from "lucide-react";

interface ContextPanelProps {
  conversation: Conversation;
}

export const ContextPanel = ({ conversation }: ContextPanelProps) => {
  // Obter as fontes únicas de todas as mensagens
  const allSources = conversation.messages
    .filter((msg) => msg.sources && msg.sources.length > 0)
    .flatMap((msg) => msg.sources || []);
  
  // Filtrar fontes duplicadas
  const uniqueSources = allSources.reduce((acc, source) => {
    const exists = acc.find((s) => s.title === source.title);
    if (!exists) {
      return [...acc, source];
    }
    return acc;
  }, [] as { title: string; url?: string; content?: string }[]);
  
  // Pegar os principais pontos da conversa (simulado)
  const conversationSummary = "Esta conversa aborda dúvidas sobre os principais recursos e funcionalidades do sistema.";
  
  // Sugerir perguntas relacionadas com base no conteúdo atual da conversa
  const suggestedQuestions = [
    "Como posso otimizar minhas campanhas de marketing?",
    "Quais são os relatórios disponíveis no módulo de Analytics?",
    "Como configurar integrações com outros serviços?",
  ];

  return (
    <div className="h-full border-l border-border bg-background w-full overflow-y-auto p-3 space-y-4">
      <div className="sticky top-0 bg-background pt-2 pb-3 border-b border-border mb-2">
        <h2 className="text-xl font-semibold">Contexto</h2>
      </div>

      {uniqueSources.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Fontes Consultadas
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <ul className="space-y-2 text-sm">
              {uniqueSources.map((source, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-2">•</span>
                  {source.url ? (
                    <a
                      href={source.url}
                      className="hover:underline text-blue-500 dark:text-blue-400"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.title}
                    </a>
                  ) : (
                    source.title
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Resumo da Conversa
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <p className="text-sm">{conversationSummary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <LayoutList className="h-4 w-4 mr-2" />
            Perguntas Relacionadas
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <ul className="space-y-2 text-sm">
            {suggestedQuestions.map((question, idx) => (
              <li key={idx} className="cursor-pointer hover:text-primary transition-colors flex items-start">
                <span className="mr-2">•</span>
                {question}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};