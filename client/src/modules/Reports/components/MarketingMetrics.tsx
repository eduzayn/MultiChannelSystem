import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DateRange } from "react-day-picker";

interface MarketingMetricsProps {
  dateRange?: DateRange;
  team?: string;
  selectedUsers?: string[];
}

export const MarketingMetrics = ({ dateRange, team, selectedUsers }: MarketingMetricsProps) => {
  // Dados de exemplo para métricas de campanha
  const campaignData = [
    { name: "Campanha A", enviados: 5000, entregas: 4850, abertos: 2100, cliques: 950, respostas: 320 },
    { name: "Campanha B", enviados: 7500, entregas: 7350, abertos: 3800, cliques: 1520, respostas: 520 },
    { name: "Campanha C", enviados: 3200, entregas: 3100, abertos: 1800, cliques: 720, respostas: 250 },
    { name: "Campanha D", enviados: 6800, entregas: 6600, abertos: 3200, cliques: 1350, respostas: 480 },
    { name: "Campanha E", enviados: 4500, entregas: 4350, abertos: 2400, cliques: 980, respostas: 310 },
  ];

  // Dados de exemplo para ROI
  const roiData = [
    { name: "Jan", roi: 2.5 },
    { name: "Fev", roi: 3.1 },
    { name: "Mar", roi: 2.8 },
    { name: "Abr", roi: 3.4 },
    { name: "Mai", roi: 3.7 },
    { name: "Jun", roi: 4.1 },
  ];

  // Dados de exemplo para segmentação de público
  const segmentData = [
    { name: "Clientes Ativos", engagement: 45 },
    { name: "Clientes Inativos", engagement: 15 },
    { name: "Leads Quentes", engagement: 38 },
    { name: "Leads Frios", engagement: 12 },
  ];

  const COLORS = ["#8B5CF6", "#0EA5E9", "#F97316", "#D946EF"];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Visão Geral das Campanhas</CardTitle>
          <CardDescription>
            Performance consolidada de campanhas de marketing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">97.2%</div>
                <p className="text-xs text-muted-foreground">
                  +0.5% comparado ao período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Abertura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">52.3%</div>
                <p className="text-xs text-muted-foreground">
                  +3.2% comparado ao período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Clique (CTR)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">21.8%</div>
                <p className="text-xs text-muted-foreground">
                  +1.5% comparado ao período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Resposta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7.2%</div>
                <p className="text-xs text-muted-foreground">
                  +0.8% comparado ao período anterior
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Comparativo de Campanhas</CardTitle>
          <CardDescription>Performance das principais campanhas de marketing</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ChartContainer 
            config={{
              entregas: { 
                label: "Entregas",
                color: "#8B5CF6" 
              },
              abertos: { 
                label: "Abertos",
                color: "#0EA5E9" 
              },
              cliques: {
                label: "Cliques", 
                color: "#F97316"
              },
              respostas: {
                label: "Respostas",
                color: "#D946EF"
              }
            }}
          >
            <BarChart 
              data={campaignData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="entregas" name="Entregas" fill="var(--color-entregas)" />
              <Bar dataKey="abertos" name="Abertos" fill="var(--color-abertos)" />
              <Bar dataKey="cliques" name="Cliques" fill="var(--color-cliques)" />
              <Bar dataKey="respostas" name="Respostas" fill="var(--color-respostas)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ROI de Marketing</CardTitle>
          <CardDescription>Retorno sobre investimento ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={roiData}
                margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}x`, "ROI"]} />
                <Line type="monotone" dataKey="roi" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Engajamento por Segmento</CardTitle>
          <CardDescription>Taxa de engajamento por segmento de público</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="engagement"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center">
              <div className="space-y-4">
                {segmentData.map((segment, index) => (
                  <div key={segment.name} className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{segment.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Taxa de engajamento: {segment.engagement}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};