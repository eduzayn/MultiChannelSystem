import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function Inbox() {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Caixa de Entrada Unificada</h1>
              <p className="text-gray-500">
                Gerencie conversas de todos os canais de comunicação
              </p>
            </div>
            <Badge>12 não lidas</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="instagram">Instagram</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="bg-gray-50 p-8 rounded-md flex flex-col items-center justify-center">
                <div className="text-4xl mb-4">📥</div>
                <h3 className="text-lg font-medium mb-2">Caixa de Entrada Unificada</h3>
                <p className="text-center text-gray-500 mb-4">
                  Aqui você pode visualizar e responder todas as suas conversas,
                  independente do canal de comunicação.
                </p>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
                  Ver Mensagens
                </button>
              </div>
            </TabsContent>
            <TabsContent value="whatsapp" className="mt-4">
              <div className="bg-gray-50 p-8 rounded-md flex flex-col items-center justify-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-lg font-medium mb-2">WhatsApp</h3>
                <p className="text-center text-gray-500">
                  Gerencie suas conversas de WhatsApp
                </p>
              </div>
            </TabsContent>
            <TabsContent value="email" className="mt-4">
              <div className="bg-gray-50 p-8 rounded-md flex flex-col items-center justify-center">
                <div className="text-4xl mb-4">✉️</div>
                <h3 className="text-lg font-medium mb-2">Email</h3>
                <p className="text-center text-gray-500">
                  Gerencie seus emails
                </p>
              </div>
            </TabsContent>
            <TabsContent value="chat" className="mt-4">
              <div className="bg-gray-50 p-8 rounded-md flex flex-col items-center justify-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-medium mb-2">Chat</h3>
                <p className="text-center text-gray-500">
                  Gerencie seus chats do site
                </p>
              </div>
            </TabsContent>
            <TabsContent value="instagram" className="mt-4">
              <div className="bg-gray-50 p-8 rounded-md flex flex-col items-center justify-center">
                <div className="text-4xl mb-4">📸</div>
                <h3 className="text-lg font-medium mb-2">Instagram</h3>
                <p className="text-center text-gray-500">
                  Gerencie suas mensagens do Instagram
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
