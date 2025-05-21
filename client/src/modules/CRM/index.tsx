import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersRound, Building, UserPlus, FileSearch, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ContactsList } from './components/ContactsList';
import { CompaniesList } from './components/CompaniesList';
import { ContactForm } from './components/ContactForm';
import { CompanyForm } from './components/CompanyForm';
import { useToast } from '@/hooks/use-toast';

export const CRMModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState("contacts");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingContact, setEditingContact] = useState<number | null>(null);
  const [editingCompany, setEditingCompany] = useState<number | null>(null);
  const { toast } = useToast();

  const handleNewContact = () => {
    setEditingContact(null);
    setShowContactForm(true);
  };

  const handleNewCompany = () => {
    setEditingCompany(null);
    setShowCompanyForm(true);
  };

  const handleEditContact = (contactId: number) => {
    setEditingContact(contactId);
    setShowContactForm(true);
  };

  const handleEditCompany = (companyId: number) => {
    setEditingCompany(companyId);
    setShowCompanyForm(true);
  };

  const handleContactFormClose = (saved: boolean) => {
    setShowContactForm(false);
    setEditingContact(null);
    if (saved) {
      toast({
        title: "Contato salvo",
        description: "Contato salvo com sucesso."
      });
    }
  };

  const handleCompanyFormClose = (saved: boolean) => {
    setShowCompanyForm(false);
    setEditingCompany(null);
    if (saved) {
      toast({
        title: "Empresa salva",
        description: "Empresa salva com sucesso."
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar..." 
              className="pl-8"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            variant={activeTab === "contacts" ? "default" : "outline"}
            onClick={() => activeTab === "contacts" ? handleNewContact() : handleNewCompany()}
            className="flex items-center gap-1"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Novo {activeTab === "contacts" ? "Contato" : "Empresa"}
          </Button>
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="flex-1 flex flex-col"
      >
        <div className="border-b">
          <div className="container mx-auto">
            <TabsList className="mt-2">
              <TabsTrigger value="contacts" className="flex items-center gap-2">
                <UsersRound className="h-4 w-4" />
                <span>Contatos</span>
              </TabsTrigger>
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>Empresas</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="contacts" className="h-full overflow-auto p-4">
            <ContactsList 
              searchTerm={searchTerm} 
              onEditContact={handleEditContact} 
            />
          </TabsContent>
          
          <TabsContent value="companies" className="h-full overflow-auto p-4">
            <CompaniesList 
              searchTerm={searchTerm} 
              onEditCompany={handleEditCompany} 
            />
          </TabsContent>
        </div>
      </Tabs>

      {showContactForm && (
        <ContactForm 
          contactId={editingContact}
          onClose={handleContactFormClose}
        />
      )}

      {showCompanyForm && (
        <CompanyForm 
          companyId={editingCompany}
          onClose={handleCompanyFormClose}
        />
      )}
    </div>
  );
};