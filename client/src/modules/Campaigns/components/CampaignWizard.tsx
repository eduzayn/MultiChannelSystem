import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Steps } from "@/components/ui/steps";
import { uuidv4 } from "@/lib/utils";
import CampaignDetailsForm from "./CampaignDetailsForm";
import CampaignAudienceForm from "./CampaignAudienceForm";
import CampaignContentForm from "./CampaignContentForm";
import CampaignScheduleForm from "./CampaignScheduleForm";
import CampaignReviewForm from "./CampaignReviewForm";
import { Campaign } from "../types/campaign.types";

const CampaignWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignData, setCampaignData] = useState<Partial<Campaign>>({
    id: uuidv4(),
    status: "draft",
    createdAt: new Date().toISOString(),
  });

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleDataChange = (newData: Partial<Campaign>) => {
    setCampaignData({ ...campaignData, ...newData });
  };

  const handleFinish = () => {
    // Aqui seria feita a chamada à API para salvar a campanha
    console.log("Campanha finalizada:", campaignData);
    // E redirecionamento para a lista de campanhas
  };

  // Renderizar o formulário atual baseado no passo
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CampaignDetailsForm
            data={campaignData}
            onDataChange={handleDataChange}
          />
        );
      case 1:
        return (
          <CampaignAudienceForm
            data={campaignData}
            onDataChange={handleDataChange}
          />
        );
      case 2:
        return (
          <CampaignContentForm
            data={campaignData}
            onDataChange={handleDataChange}
          />
        );
      case 3:
        return (
          <CampaignScheduleForm
            data={campaignData}
            onDataChange={handleDataChange}
          />
        );
      case 4:
        return <CampaignReviewForm data={campaignData} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <Steps
        currentStep={currentStep}
        steps={[
          "Detalhes",
          "Audiência",
          "Conteúdo",
          "Agendamento",
          "Revisar"
        ]}
      />

      <div className="mt-8">{renderStepContent()}</div>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Voltar
        </Button>

        <div>
          {currentStep < 4 ? (
            <Button onClick={handleNext}>Próximo</Button>
          ) : (
            <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
              Finalizar Campanha
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;