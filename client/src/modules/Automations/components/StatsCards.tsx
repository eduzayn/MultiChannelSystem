import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, ZapOff, Clock } from "lucide-react";

interface StatsCardsProps {
  totalWorkflows: number;
  activeContacts: number;
  actions24h: number;
  withErrors: number;
}

const StatsCards = ({
  totalWorkflows,
  activeContacts,
  actions24h,
  withErrors
}: StatsCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0">
            <div>
              <p className="text-sm text-muted-foreground">Total Workflows</p>
              <p className="text-2xl font-bold">{totalWorkflows}</p>
            </div>
            <div className="bg-gray-100 rounded-full p-2 dark:bg-gray-800">
              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0">
            <div>
              <p className="text-sm text-muted-foreground">Contatos Ativos</p>
              <p className="text-2xl font-bold">{activeContacts}</p>
            </div>
            <div className="bg-green-100 rounded-full p-2 dark:bg-green-900">
              <Users className="h-5 w-5 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0">
            <div>
              <p className="text-sm text-muted-foreground">Ações 24h</p>
              <p className="text-2xl font-bold">{actions24h}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-2 dark:bg-blue-900">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0">
            <div>
              <p className="text-sm text-muted-foreground">Com Erros</p>
              <p className="text-2xl font-bold">{withErrors}</p>
            </div>
            <div className="bg-red-100 rounded-full p-2 dark:bg-red-900">
              <ZapOff className="h-5 w-5 text-red-600 dark:text-red-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;