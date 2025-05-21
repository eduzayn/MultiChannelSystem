import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { BrandingTab } from "./components/BrandingTab";

export const BrandingSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência e Branding</CardTitle>
        <CardDescription>
          Personalize a aparência e a marca da sua plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BrandingTab />
      </CardContent>
    </Card>
  );
};