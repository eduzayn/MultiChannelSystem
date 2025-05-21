import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Chat() {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <h1 className="text-2xl font-bold">Chat Interno</h1>
          <p className="text-gray-500">
            Comunique-se com sua equipe em tempo real
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="channels">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="channels">Canais</TabsTrigger>
              <TabsTrigger value="direct">Mensagens Diretas</TabsTrigger>
            </TabsList>
            <TabsContent value="channels" className="mt-4">
              <div className="bg-gray-50 p-8 rounded-md flex flex-col items-center justify-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-medium mb-2">Bem-vindo aos Canais</h3>
                <p className="text-center text-gray-500 mb-4">
                  Aqui você pode conversar com sua equipe em canais específicos.
                  Crie um novo canal ou selecione um existente para começar.
                </p>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
                  Criar Canal
                </button>
              </div>
            </TabsContent>
            <TabsContent value="direct" className="mt-4">
              <div className="bg-gray-50 p-8 rounded-md flex flex-col items-center justify-center">
                <div className="text-4xl mb-4">👋</div>
                <h3 className="text-lg font-medium mb-2">Mensagens Diretas</h3>
                <p className="text-center text-gray-500 mb-4">
                  Envie mensagens privadas para qualquer membro da sua equipe.
                  Selecione um usuário para iniciar uma conversa.
                </p>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
                  Nova Mensagem
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
