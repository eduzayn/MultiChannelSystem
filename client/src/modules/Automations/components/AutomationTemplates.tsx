import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, Users, BarChart2, Calendar, ShoppingBag, Book } from "lucide-react";
import { automationTemplates } from "../data/mockTemplates";
import { AutomationTemplate } from "../types/automation.types";

const AutomationTemplates = () => {
  const categories = ["all", "crm", "support", "ecommerce", "education"];
  const categoryLabels = {
    all: "Todos",
    crm: "CRM/Vendas",
    support: "Atendimento",
    ecommerce: "E-commerce",
    education: "Educacional"
  };

  const categoryIcons = {
    crm: <BarChart2 className="h-5 w-5 text-green-500" />,
    support: <Users className="h-5 w-5 text-blue-500" />,
    ecommerce: <ShoppingBag className="h-5 w-5 text-purple-500" />,
    education: <Book className="h-5 w-5 text-orange-500" />,
  };
  
  const handleUseTemplate = (template: AutomationTemplate) => {
    // Em uma implementação real, isso navegaria para o editor de automação
    // com os dados do template pré-carregados
    console.log("Usando template:", template);
  };
  
  return (
    <div>
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {categoryLabels[category as keyof typeof categoryLabels]}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {automationTemplates
                .filter(template => category === "all" || template.category === category)
                .map(template => (
                  <Card key={template.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {category !== "all" && categoryIcons[template.category as keyof typeof categoryIcons] || 
                         <Rocket className="h-5 w-5 text-primary" />}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{template.complexity}</Badge>
                          <Badge variant="secondary">{template.stepsCount} etapas</Badge>
                        </div>
                        
                        <div className="text-sm">
                          <div className="font-medium mb-1">Melhor para</div>
                          <ul className="list-disc pl-5 text-muted-foreground">
                            {template.benefits.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => handleUseTemplate(template)}>
                        Usar este template
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AutomationTemplates;