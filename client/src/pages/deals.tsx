import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, KanbanSquare, ListFilter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Deals() {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Negócios/Oportunidades</h1>
              <p className="text-gray-500">
                Gerencie seu funil de vendas e oportunidades
              </p>
            </div>
            <Button className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Negócio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input 
                className="pl-10" 
                placeholder="Buscar negócios..." 
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
          
          <Tabs defaultValue="funnel">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="funnel" className="flex items-center">
                <KanbanSquare className="mr-2 h-4 w-4" />
                Funil (Kanban)
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center">
                <ListFilter className="mr-2 h-4 w-4" />
                Lista
              </TabsTrigger>
            </TabsList>
            <TabsContent value="funnel">
              <div className="bg-gray-50 p-8 rounded-md flex flex-col items-center justify-center">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-lg font-medium mb-2">Funil de Vendas</h3>
                <p className="text-center text-gray-500 mb-4">
                  Visualize e gerencie seus negócios através de um funil de vendas visual,
                  desde o primeiro contato até o fechamento.
                </p>
                <Button variant="default">
                  Configurar Funil
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="list">
              <div className="bg-gray-50 p-8 rounded-md flex flex-col items-center justify-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium mb-2">Lista de Negócios</h3>
                <p className="text-center text-gray-500 mb-4">
                  Visualize todos os seus negócios em uma lista detalhada,
                  com filtros e opções de ordenação.
                </p>
                <Button variant="default">
                  Exportar Lista
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
