import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Contacts() {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Contatos</h1>
              <p className="text-gray-500">
                Gerencie seus contatos e clientes
              </p>
            </div>
            <Button className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Contato
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input 
                className="pl-10" 
                placeholder="Buscar contatos..." 
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-md flex flex-col items-center justify-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium mb-2">Gestão de Contatos</h3>
            <p className="text-center text-gray-500 mb-4">
              Aqui você pode gerenciar todos os seus contatos, 
              visualizar histórico de interações e detalhes.
            </p>
            <Button variant="default">
              Importar Contatos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
