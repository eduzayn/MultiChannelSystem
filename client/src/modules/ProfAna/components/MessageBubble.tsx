import { useState } from "react";
import { Message } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Copy, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Brain } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const [isRated, setIsRated] = useState<boolean>(false);
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const isUser = message.role === "user";
  const { toast } = useToast();
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência.",
    });
  };

  const handleRating = (vote: "up" | "down") => {
    setRating(vote);
    setIsRated(true);
    toast({
      title: "Feedback enviado",
      description: vote === "up" ? "Obrigado pelo feedback positivo!" : "Agradecemos seu feedback.",
    });
  };

  const handlePlayAudio = () => {
    if (message.audioUrl) {
      const audio = new Audio(message.audioUrl);
      audio.play();
    }
  };

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-4 items-start`}
    >
      {!isUser && (
        <div className="mr-2">
          <Avatar className="h-8 w-8">
            <AvatarImage />
            <AvatarFallback className="bg-primary/10 text-primary">
              <Brain className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      <div
        className={`max-w-[85%] ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tl-lg rounded-bl-lg rounded-tr-lg"
            : "bg-muted rounded-tr-lg rounded-br-lg rounded-bl-lg"
        } p-3`}
      >
        <div className="flex flex-col">
          <div className="break-words whitespace-pre-wrap">
            {message.content}
          </div>
          
          {message.audioUrl && (
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={handlePlayAudio}
              >
                <Volume2 className="mr-1 h-3 w-3" /> Ouvir áudio
              </Button>
            </div>
          )}
          
          {message.sources && message.sources.length > 0 && (
            <div className="mt-2 text-sm border-t pt-2 border-border/30">
              <p className="font-medium text-xs mb-1">Fontes:</p>
              <ul className="list-disc list-inside space-y-1">
                {message.sources.map((source, idx) => (
                  <li key={idx} className="text-xs">
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
            </div>
          )}
          
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs opacity-70">
              {formatDistance(message.timestamp, new Date(), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>

            {!isUser && (
              <div className="flex space-x-1">
                {!isRated ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRating("up")}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRating("down")}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {rating === "up" ? "👍 Útil" : "👎 Não útil"}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopy}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isUser && (
        <div className="ml-2">
          <Avatar className="h-8 w-8">
            <AvatarImage />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
};