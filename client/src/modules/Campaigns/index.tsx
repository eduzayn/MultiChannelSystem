import React from 'react';
import { useLocation } from 'wouter';
import CampaignsList from './components/CampaignsList';
import CampaignWizard from './components/CampaignWizard';

const CampaignsModule = () => {
  const [location] = useLocation();
  const isNewCampaign = location.includes('/new');

  return (
    <div className="space-y-6">
      {isNewCampaign ? (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Nova Campanha</h1>
          </div>
          <CampaignWizard />
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Campanhas de Marketing</h1>
          </div>
          <CampaignsList />
        </>
      )}
    </div>
  );
};

export default CampaignsModule;