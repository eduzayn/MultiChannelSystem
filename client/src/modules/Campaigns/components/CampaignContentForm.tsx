import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Campaign } from "../types/campaign.types";

interface CampaignContentFormProps {
  data: Partial<Campaign>;
  onDataChange: (data: Partial<Campaign>) => void;
}

const CampaignContentForm = ({ data, onDataChange }: CampaignContentFormProps) => {
  const [subject, setSubject] = useState(data.content?.subject || "");
  const [messageBody, setMessageBody] = useState(data.content?.body || "");
  const [attachments, setAttachments] = useState<string[]>(data.content?.attachments || []);

  // Update parent component when form values change
  useEffect(() => {
    onDataChange({
      ...data,
      content: {
        subject,
        body: messageBody,
        attachments,
      },
    });
  }, [subject, messageBody, attachments, onDataChange]);

  // Handle file upload button click
  const handleAddAttachment = () => {
    // In a real application, this would open a file picker
    // For now, we'll just add a placeholder
    setAttachments([...attachments, `Arquivo_${attachments.length + 1}.pdf`]);
  };

  // Remove an attachment
  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  // Get placeholder text based on campaign channel
  const getPlaceholderText = () => {
    switch (data.channel) {
      case "whatsapp":
        return "Digite sua mensagem de WhatsApp aqui... Use {{nome}} para inserir o nome do contato.";
      case "email":
        return "Digite o corpo do email aqui... Use formatação HTML se necessário. Use {{nome}} para inserir o nome do contato.";
      case "sms":
        return "Digite sua mensagem SMS aqui... (Máximo 160 caracteres). Use {{nome}} para inserir o nome do contato.";
      case "conversation":
        return "Digite a mensagem para iniciar a conversa aqui... Use {{nome}} para inserir o nome do contato.";
      default:
        return "Digite sua mensagem aqui...";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Conteúdo da Campanha</h2>
        <p className="text-muted-foreground">
          Personalize a mensagem que será enviada aos seus contatos
        </p>
      </div>

      <div className="space-y-4">
        {data.channel === "email" && (
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto do Email</Label>
            <Input
              id="subject"
              placeholder="Digite o assunto do email..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="message-body">Mensagem</Label>
          <Textarea
            id="message-body"
            placeholder={getPlaceholderText()}
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            className="min-h-[200px]"
          />
          <p className="text-sm text-muted-foreground">
            Use {"{{"} variável {"}}"}  para inserir dados dinâmicos. Ex: {"{{"}nome{"}}"} 
          </p>
        </div>

        <div className="space-y-2">
          <Label>Anexos</Label>
          <Card>
            <CardContent className="p-4">
              {attachments.length > 0 ? (
                <ul className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{attachment}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        Remover
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Nenhum anexo adicionado.</p>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleAddAttachment}
                className="mt-4"
              >
                <Upload className="mr-2 h-4 w-4" />
                Adicionar Anexo
              </Button>
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground">
            Anexos são suportados apenas para campanhas de Email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignContentForm;