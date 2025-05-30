import { Campaign } from "../types/campaign.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MessageSquare, Mail, MessagesSquare, Phone } from "lucide-react";

interface CampaignDetailsFormProps {
  data: Partial<Campaign>;
  onDataChange: (data: Partial<Campaign>) => void;
}

export const CampaignDetailsForm = ({ data, onDataChange }: CampaignDetailsFormProps) => {
  // Função para atualizar campos específicos
  const handleInputChange = (field: keyof Campaign, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Detalhes da Campanha</h2>
        <p className="text-muted-foreground">
          Informe os detalhes básicos da sua campanha de marketing
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="campaign-name">Nome da Campanha</Label>
          <Input
            id="campaign-name"
            placeholder="Ex: Promoção de Aniversário, Novos Produtos, etc."
            value={data.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo de Campanha</Label>
          <RadioGroup
            value={data.channel}
            onValueChange={(value) => handleInputChange("channel", value)}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <Card className={`cursor-pointer transition-all ${data.channel === "whatsapp" ? "border-primary" : ""}`}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <RadioGroupItem value="whatsapp" id="whatsapp" className="sr-only" />
                <Label htmlFor="whatsapp" className="cursor-pointer flex flex-col items-center gap-2">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                  <span>WhatsApp</span>
                </Label>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-all ${data.channel === "sms" ? "border-primary" : ""}`}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <RadioGroupItem value="sms" id="sms" className="sr-only" />
                <Label htmlFor="sms" className="cursor-pointer flex flex-col items-center gap-2">
                  <Phone className="h-8 w-8 text-blue-600" />
                  <span>SMS</span>
                </Label>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-all ${data.channel === "email" ? "border-primary" : ""}`}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <RadioGroupItem value="email" id="email" className="sr-only" />
                <Label htmlFor="email" className="cursor-pointer flex flex-col items-center gap-2">
                  <Mail className="h-8 w-8 text-orange-600" />
                  <span>Email</span>
                </Label>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-all ${data.channel === "conversation" ? "border-primary" : ""}`}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <RadioGroupItem value="conversation" id="conversation" className="sr-only" />
                <Label htmlFor="conversation" className="cursor-pointer flex flex-col items-center gap-2">
                  <MessagesSquare className="h-8 w-8 text-purple-600" />
                  <span>Conversa</span>
                </Label>
              </CardContent>
            </Card>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign-description">Descrição (opcional)</Label>
          <Textarea
            id="campaign-description"
            placeholder="Descreva o objetivo desta campanha, promoção ou comunicação..."
            value={data.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sender-name">Nome do Remetente</Label>
          <Input
            id="sender-name"
            placeholder="Ex: Empresa XYZ, Suporte, Nome da sua empresa..."
            value={data.senderPhone || ""}
            onChange={(e) => handleInputChange("senderPhone", e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Este é o nome que aparecerá como remetente da mensagem.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailsForm;