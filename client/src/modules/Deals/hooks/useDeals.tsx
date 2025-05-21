import { useState, useEffect } from 'react';
import { Deal, Stage } from '../types/deals.types';

export const useDeals = () => {
  // Mock de dados para estágios
  const stages: Stage[] = [
    { id: 'prospecting', name: 'Prospecção', color: '#3498db', order: 1 },
    { id: 'qualification', name: 'Qualificação', color: '#9b59b6', order: 2 },
    { id: 'proposal', name: 'Proposta', color: '#f39c12', order: 3 },
    { id: 'negotiation', name: 'Negociação', color: '#1abc9c', order: 4 },
    { id: 'won', name: 'Ganho', color: '#2ecc71', order: 5 },
    { id: 'lost', name: 'Perdido', color: '#e74c3c', order: 6 },
  ];

  // Mock de dados para negócios
  const mockDeals: Deal[] = [
    {
      id: '1',
      name: 'Implementação de CRM',
      company: 'TechCorp',
      companyLogo: '',
      value: 25000,
      stage: 'prospecting',
      stageColor: '#3498db',
      status: 'open',
      probability: 10,
      closeDate: '2023-06-15',
      createdDate: '2023-05-14',
      updatedDate: '2023-05-14',
      owner: 'Maria',
      ownerAvatar: '',
      health: 85,
      tags: [
        { id: '1', name: 'Urgente', color: '#e74c3c' },
        { id: '2', name: 'Novo cliente', color: '#2ecc71' },
      ],
    },
    {
      id: '2',
      name: 'Renovação de Licença',
      company: 'MegaSoft',
      companyLogo: '',
      value: 12000,
      stage: 'qualification',
      stageColor: '#9b59b6',
      status: 'open',
      probability: 30,
      closeDate: '2023-07-09',
      createdDate: '2023-05-10',
      updatedDate: '2023-05-10',
      owner: 'João',
      ownerAvatar: '',
      health: 75,
      tags: [
        { id: '3', name: 'Renovação', color: '#3498db' },
      ],
    },
    {
      id: '3',
      name: 'Expansão de Serviços',
      company: 'InnovaTech',
      companyLogo: '',
      value: 35000,
      stage: 'proposal',
      stageColor: '#f39c12',
      status: 'open',
      probability: 60,
      closeDate: '2023-05-29',
      createdDate: '2023-04-20',
      updatedDate: '2023-05-01',
      owner: 'Carlos',
      ownerAvatar: '',
      health: 90,
      tags: [
        { id: '4', name: 'Alta prioridade', color: '#e67e22' },
        { id: '5', name: 'Cliente premium', color: '#f1c40f' },
      ],
    },
    {
      id: '4',
      name: 'Implementação ERP',
      company: 'GlobalSystems',
      companyLogo: '',
      value: 85000,
      stage: 'negotiation',
      stageColor: '#1abc9c',
      status: 'open',
      probability: 80,
      closeDate: '2023-06-28',
      createdDate: '2023-04-15',
      updatedDate: '2023-05-05',
      owner: 'Mariana',
      ownerAvatar: '',
      health: 95,
      tags: [
        { id: '6', name: 'Projeto grande', color: '#9b59b6' },
        { id: '7', name: 'ERP', color: '#34495e' },
      ],
    },
    {
      id: '5',
      name: 'Migração para Nuvem',
      company: 'DataSafe',
      companyLogo: '',
      value: 42000,
      stage: 'won',
      stageColor: '#2ecc71',
      status: 'won',
      probability: 100,
      closeDate: '2023-04-14',
      createdDate: '2023-03-01',
      updatedDate: '2023-04-14',
      owner: 'Carlos',
      ownerAvatar: '',
      health: 100,
      tags: [
        { id: '8', name: 'Ganho', color: '#2ecc71' },
        { id: '9', name: 'Migração', color: '#3498db' },
      ],
    },
    {
      id: '6',
      name: 'Licenças de Software',
      company: 'TechFirm',
      companyLogo: '',
      value: 18000,
      stage: 'lost',
      stageColor: '#e74c3c',
      status: 'lost',
      probability: 0,
      closeDate: '2023-03-29',
      createdDate: '2023-02-15',
      updatedDate: '2023-03-29',
      owner: 'João',
      ownerAvatar: '',
      health: 0,
      tags: [
        { id: '10', name: 'Perdido', color: '#e74c3c' },
      ],
    },
    {
      id: '7',
      name: 'Consultoria Estratégica',
      company: 'StrategyCorp',
      companyLogo: '',
      value: 50000,
      stage: 'prospecting',
      stageColor: '#3498db',
      status: 'open',
      probability: 10,
      closeDate: '2023-08-19',
      createdDate: '2023-05-19',
      updatedDate: '2023-05-19',
      owner: 'Mariana',
      ownerAvatar: '',
      health: 60,
      tags: [
        { id: '11', name: 'Nova oportunidade', color: '#27ae60' },
      ],
    },
  ];

  const [deals, setDeals] = useState<Deal[]>(mockDeals);

  // Agrupar negócios por estágio para visualização Kanban
  const dealGroups = stages.reduce((acc, stage) => {
    acc[stage.id] = deals.filter(deal => deal.stage === stage.id);
    return acc;
  }, {} as Record<string, Deal[]>);

  // Função para mover um negócio entre estágios
  const moveDeal = (dealId: string, targetStageId: string) => {
    // Encontrar o estágio para obter a cor
    const stageInfo = stages.find(s => s.id === targetStageId);
    if (!stageInfo) return;

    // Atualizar o estado
    setDeals(prevDeals =>
      prevDeals.map(deal => {
        if (deal.id === dealId) {
          return {
            ...deal,
            stage: targetStageId,
            stageColor: stageInfo.color,
            status: targetStageId === 'won' 
              ? 'won' 
              : targetStageId === 'lost' 
                ? 'lost' 
                : 'open',
            updatedDate: new Date().toISOString().split('T')[0]
          };
        }
        return deal;
      })
    );
  };

  return {
    deals,
    setDeals,
    stages,
    dealGroups,
    moveDeal
  };
};