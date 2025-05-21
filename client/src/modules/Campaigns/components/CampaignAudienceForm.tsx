import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Campaign } from "../types/campaign.types";

interface CampaignAudienceFormProps {
  data: Partial<Campaign>;
  onDataChange: (data: Partial<Campaign>) => void;
}

// Dados fictícios para as listas de audiência
const audienceLists = [
  { id: "1", name: "Leads Qualificados", size: 128, description: "Leads que demonstraram interesse nos últimos 30 dias" },
  { id: "2", name: "Clientes Ativos", size: 543, description: "Clientes com compras nos últimos 6 meses" },
  { id: "3", name: "Clientes Inativos", size: 267, description: "Clientes sem compras há mais de 6 meses" },
  { id: "4", name: "Oportunidades Perdidas", size: 89, description: "Negócios que não se concretizaram nos últimos 3 meses" },
  { id: "5", name: "Lista VIP", size: 42, description: "Clientes com alto valor de compra recorrente" }
];

export const CampaignAudienceForm = ({ data, onDataChange }: CampaignAudienceFormProps) => {
  const [search, setSearch] = useState("");
  
  // Filtra as listas com base na busca
  const filteredLists = audienceLists.filter(list => 
    list.name.toLowerCase().includes(search.toLowerCase()) ||
    list.description.toLowerCase().includes(search.toLowerCase())
  );
  
  // Seleciona uma lista
  const handleSelectList = (listId: string) => {
    const selectedList = audienceLists.find(list => list.id === listId);
    if (selectedList) {
      onDataChange({
        ...data,
        audience: {
          ...(data.audience || {}),
          name: selectedList.name,
          size: selectedList.size,
          id: selectedList.id
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Selecione a Audiência</h2>
        <p className="text-muted-foreground">
          Escolha o público alvo para sua campanha
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar listas..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <RadioGroup
          value={data.audience?.id}
          onValueChange={handleSelectList}
        >
          {filteredLists.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhuma lista encontrada com o termo "{search}"
              </CardContent>
            </Card>
          ) : (
            filteredLists.map((list) => (
              <Card 
                key={list.id}
                className={`overflow-hidden transition-colors ${data.audience?.id === list.id ? 'border-primary' : ''}`}
              >
                <CardContent className="p-0">
                  <label 
                    htmlFor={`list-${list.id}`}
                    className="flex items-start p-4 cursor-pointer"
                  >
                    <RadioGroupItem 
                      value={list.id} 
                      id={`list-${list.id}`}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-grow">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{list.name}</span>
                        <Badge variant="outline">
                          {list.size} contatos
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {list.description}
                      </p>
                    </div>
                  </label>
                </CardContent>
              </Card>
            ))
          )}
        </RadioGroup>

        {data.audience?.id && (
          <div className="pt-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Estatísticas da lista</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Tamanho total</dt>
                    <dd className="font-medium">{data.audience.size} contatos</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Qualidade estimada</dt>
                    <dd className="font-medium">Alta</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Última atualização</dt>
                    <dd className="font-medium">Hoje</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Canal preferencial</dt>
                    <dd className="font-medium">WhatsApp (87%)</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignAudienceForm;