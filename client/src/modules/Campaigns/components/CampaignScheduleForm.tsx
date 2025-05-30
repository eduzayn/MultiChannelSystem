import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Campaign } from "../types/campaign.types";

interface CampaignScheduleFormProps {
  data: Partial<Campaign>;
  onDataChange: (data: Partial<Campaign>) => void;
}

export const CampaignScheduleForm = ({ data, onDataChange }: CampaignScheduleFormProps) => {
  const [scheduleType, setScheduleType] = useState<"now" | "later">(data.scheduledAt ? "later" : "now");
  
  // Extrair data e hora do scheduledAt se existir
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    data.scheduledAt ? new Date(data.scheduledAt) : undefined
  );
  
  const [scheduledTime, setScheduledTime] = useState<string>(
    data.scheduledAt ? format(new Date(data.scheduledAt), "HH:mm") : "12:00"
  );

  useEffect(() => {
    if (scheduleType === "now") {
      // Se for agora, limpa a data agendada
      onDataChange({ ...data, scheduledAt: undefined });
    } else if (scheduleType === "later" && scheduledDate) {
      // Se for agendado e tiver data, combina data e hora
      const [hours, minutes] = scheduledTime.split(":").map(Number);
      const dateTime = new Date(scheduledDate);
      dateTime.setHours(hours, minutes);
      onDataChange({ ...data, scheduledAt: dateTime.toISOString() });
    }
  }, [scheduleType, scheduledDate, scheduledTime]);

  const handleDateSelect = (date: Date | undefined) => {
    setScheduledDate(date);
  };

  const handleTimeChange = (time: string) => {
    setScheduledTime(time);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Agendamento</h2>
        <p className="text-muted-foreground">
          Escolha quando sua campanha será enviada
        </p>
      </div>

      <RadioGroup
        value={scheduleType}
        onValueChange={(value) => setScheduleType(value as "now" | "later")}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="now" id="now" />
          <Label htmlFor="now">Enviar agora</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="later" id="later" />
          <Label htmlFor="later">Agendar para data e hora específicas</Label>
        </div>
      </RadioGroup>

      {scheduleType === "later" && (
        <div className="grid gap-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                    id="date"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {scheduledDate ? (
                      format(scheduledDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={scheduledDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => handleTimeChange(e.target.value)}
              />
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Sua campanha será enviada automaticamente na data e hora especificadas.
          </p>
        </div>
      )}
    </div>
  );
};

export default CampaignScheduleForm;