import { Campaign } from "../types/campaign.types";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CampaignReviewFormProps {
  data: Partial<Campaign>;
}

const CampaignReviewForm = ({ data }: CampaignReviewFormProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Revisar Campanha</h2>
        <p className="text-muted-foreground">
          Verifique todos os detalhes da sua campanha antes de finalizar
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Detalhes da Campanha</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Nome da Campanha</dt>
                <dd className="mt-1">{data.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Tipo</dt>
                <dd className="mt-1">{data.channel || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Descrição</dt>
                <dd className="mt-1 whitespace-pre-line">{data.description || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Enviado por</dt>
                <dd className="mt-1">{data.senderPhone || "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Audiência</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Segmento</dt>
                <dd className="mt-1">{data.audience?.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Tamanho do público</dt>
                <dd className="mt-1">{data.audience?.size ? `${data.audience.size} contatos` : "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Filtros aplicados</dt>
                <dd className="mt-1">
                  {data.audience?.filters && data.audience.filters.length > 0
                    ? data.audience.filters.join(", ")
                    : "Nenhum filtro aplicado"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Conteúdo</h3>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Assunto</dt>
                <dd className="mt-1">{data.content?.subject || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Mensagem</dt>
                <dd className="mt-1 p-4 border rounded-md bg-muted/30 whitespace-pre-line">
                  {data.content?.body || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Anexos</dt>
                <dd className="mt-1">
                  {data.content?.attachments && data.content.attachments.length > 0
                    ? data.content.attachments.map((attachment, index) => (
                        <span key={index} className="block">{attachment}</span>
                      ))
                    : "Nenhum anexo"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Agendamento</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="mt-1">{data.status || "Rascunho"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Agendamento</dt>
                <dd className="mt-1">
                  {data.scheduledAt
                    ? format(new Date(data.scheduledAt), "PPP 'às' HH:mm", { locale: ptBR })
                    : "Envio imediato"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CampaignReviewForm;