import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { CompanyProfileTab } from "./components/CompanyProfileTab";

export const CompanySettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil da Empresa</CardTitle>
        <CardDescription>
          Gerencie as informações básicas da sua empresa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CompanyProfileTab />
      </CardContent>
    </Card>
  );
};