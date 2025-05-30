import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DateRange } from "react-day-picker";

interface AttendancePerformanceProps {
  dateRange?: DateRange;
  team?: string;
  selectedUsers?: string[];
}

export const AttendancePerformance = ({ dateRange, team, selectedUsers }: AttendancePerformanceProps) => {
  // Dados de exemplo para o gráfico
  const data = [
    { name: "Jan", tmr: 15.2, tmpr: 5.3, csat: 4.5 },
    { name: "Fev", tmr: 12.8, tmpr: 4.6, csat: 4.7 },
    { name: "Mar", tmr: 14.5, tmpr: 3.9, csat: 4.3 },
    { name: "Abr", tmr: 13.2, tmpr: 4.2, csat: 4.6 },
    { name: "Mai", tmr: 11.9, tmpr: 3.5, csat: 4.8 },
    { name: "Jun", tmr: 10.8, tmpr: 3.1, csat: 4.9 },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Visão Geral do Atendimento</CardTitle>
          <CardDescription>
            Principais métricas de performance do atendimento ao cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tempo Médio de Resolução (TMR)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">13.1 min</div>
                <p className="text-xs text-muted-foreground">
                  -12% comparado ao período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tempo Médio de Primeira Resposta (TMPR)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2 min</div>
                <p className="text-xs text-muted-foreground">
                  -8% comparado ao período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Satisfação do Cliente (CSAT)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.7/5.0</div>
                <p className="text-xs text-muted-foreground">
                  +5% comparado ao período anterior
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Tendências de Atendimento</CardTitle>
          <CardDescription>Evolução das principais métricas ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ChartContainer 
            config={{
              tmr: { 
                label: "TMR (min)",
                color: "#8B5CF6" 
              },
              tmpr: { 
                label: "TMPR (min)",
                color: "#0EA5E9" 
              }
            }}
          >
            <BarChart 
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="tmr" name="TMR (min)" fill="var(--color-tmr)" />
              <Bar yAxisId="left" dataKey="tmpr" name="TMPR (min)" fill="var(--color-tmpr)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volume por Canal</CardTitle>
          <CardDescription>Distribuição de conversas por canal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={[
                  { name: "WhatsApp", value: 653 },
                  { name: "Email", value: 287 },
                  { name: "SMS", value: 129 },
                  { name: "Instagram", value: 201 },
                  { name: "Facebook", value: 87 },
                ]}
                margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Horários de Pico</CardTitle>
          <CardDescription>Volume de atendimentos por hora do dia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { hora: "8h", volume: 23 },
                  { hora: "9h", volume: 45 },
                  { hora: "10h", volume: 67 },
                  { hora: "11h", volume: 89 },
                  { hora: "12h", volume: 54 },
                  { hora: "13h", volume: 42 },
                  { hora: "14h", volume: 78 },
                  { hora: "15h", volume: 95 },
                  { hora: "16h", volume: 84 },
                  { hora: "17h", volume: 63 },
                  { hora: "18h", volume: 47 },
                  { hora: "19h", volume: 32 },
                ]}
                margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
              >
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volume" fill="#0EA5E9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}