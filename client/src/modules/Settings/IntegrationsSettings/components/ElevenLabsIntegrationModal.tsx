import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  RadioGroup, 
  RadioGroupItem 
} from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Loader2, Play, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ElevenLabsIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const predefinedVoices = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria (feminina)' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger (masculina)' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (feminina)' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura (feminina)' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie (masculina)' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Ana (portuguesa, feminina)' }
];

export const ElevenLabsIntegrationModal: React.FC<ElevenLabsIntegrationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [connectionName, setConnectionName] = useState('ElevenLabs Principal');
  const [apiKey, setApiKey] = useState('');
  const [voiceType, setVoiceType] = useState<'predefined' | 'custom'>('predefined');
  const [predefinedVoiceId, setPredefinedVoiceId] = useState(predefinedVoices[0].id);
  const [customVoiceId, setCustomVoiceId] = useState('');
  const [stabilityValue, setStabilityValue] = useState([0.75]);
  const [claritySimilarityValue, setClaritySimilarityValue] = useState([0.75]);
  const [testText, setTestText] = useState('Olá, eu sou a Prof. Ana. Como posso ajudar você hoje?');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConnectionTested, setIsConnectionTested] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const { toast } = useToast();
  
  const handleTestConnection = async () => {
    if (!apiKey) {
      toast({
        title: "Campo necessário",
        description: "Por favor, forneça uma chave de API para testar a conexão.",
        variant: "destructive"
      });
      return;
    }
    
    setTestStatus('loading');
    
    // Simular um teste de API
    setTimeout(() => {
      // Simulação - em produção, faria uma chamada real à API da ElevenLabs
      const success = apiKey.length > 10;
      
      setTestStatus(success ? 'success' : 'error');
      setIsConnectionTested(true);
      
      toast({
        title: success ? "Conexão bem-sucedida" : "Erro na conexão",
        description: success 
          ? "A chave de API foi validada com sucesso."
          : "Não foi possível validar a chave de API. Por favor, verifique e tente novamente.",
        variant: success ? "default" : "destructive"
      });
    }, 1500);
  };

  const handleTestVoice = () => {
    if (!apiKey) {
      toast({
        title: "Campo necessário",
        description: "Por favor, forneça uma chave de API para testar a voz.",
        variant: "destructive"
      });
      return;
    }

    if (!testText) {
      toast({
        title: "Campo necessário",
        description: "Por favor, digite um texto para testar a voz.",
        variant: "destructive"
      });
      return;
    }

    // Em produção, essa função enviaria o texto para a API ElevenLabs e reproduziria o áudio
    setIsPlaying(true);
    
    toast({
      title: "Gerando voz",
      description: "Simulação de teste da voz. Em produção, o áudio seria reproduzido."
    });
    
    // Simulação de tempo para "reproduzir o áudio"
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey) {
      toast({
        title: "Campo necessário",
        description: "Por favor, forneça uma chave de API.",
        variant: "destructive"
      });
      return;
    }
    
    if (voiceType === 'custom' && !customVoiceId) {
      toast({
        title: "Campo necessário",
        description: "Por favor, forneça um ID de voz personalizada.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulação de envio - em produção, faria uma chamada à API
    setTimeout(() => {
      setIsSubmitting(false);
      
      toast({
        title: "Integração salva com sucesso",
        description: "A integração com ElevenLabs foi configurada."
      });
      
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Conectar com ElevenLabs</DialogTitle>
            <DialogDescription>
              Configure a síntese de voz avançada para a Prof. Ana e outras funcionalidades de áudio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="connectionName">Nome da Conexão</Label>
              <Input
                id="connectionName"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                placeholder="ex: ElevenLabs Principal"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="apiKey">Chave de API (API Key)</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Sua chave de API ElevenLabs"
              />
              <p className="text-xs text-muted-foreground">
                Encontre sua chave de API em elevenlabs.io na seção de Profile
              </p>
            </div>
            
            <div className="grid gap-2 mt-2">
              <Label>Tipo de Voz</Label>
              <RadioGroup value={voiceType} onValueChange={(value: 'predefined' | 'custom') => setVoiceType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="predefined" id="predefined" />
                  <Label htmlFor="predefined">Usar Voz Pré-definida</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">Usar Voz Personalizada</Label>
                </div>
              </RadioGroup>
            </div>
            
            {voiceType === 'predefined' ? (
              <div className="grid gap-2">
                <Label htmlFor="predefinedVoice">Voz Pré-definida</Label>
                <Select value={predefinedVoiceId} onValueChange={setPredefinedVoiceId}>
                  <SelectTrigger id="predefinedVoice">
                    <SelectValue placeholder="Selecione uma voz" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedVoices.map(voice => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="customVoiceId">ID da Voz Personalizada</Label>
                <Input
                  id="customVoiceId"
                  value={customVoiceId}
                  onChange={(e) => setCustomVoiceId(e.target.value)}
                  placeholder="ex: abcdef12345"
                />
                <p className="text-xs text-muted-foreground">
                  Encontre o ID da sua voz personalizada no painel da ElevenLabs
                </p>
              </div>
            )}
            
            <div className="grid gap-2 mt-2">
              <Label>Estabilidade da Voz: {stabilityValue[0]}</Label>
              <Slider 
                value={stabilityValue} 
                onValueChange={setStabilityValue}
                min={0} 
                max={1} 
                step={0.01} 
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground">
                Valores mais altos resultam em voz mais estável e previsível
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label>Clareza/Similaridade: {claritySimilarityValue[0]}</Label>
              <Slider 
                value={claritySimilarityValue} 
                onValueChange={setClaritySimilarityValue}
                min={0} 
                max={1} 
                step={0.01}
                className="mt-1" 
              />
              <p className="text-xs text-muted-foreground">
                Valores mais altos resultam em voz com maior clareza/similaridade
              </p>
            </div>
            
            <div className="grid gap-2 mt-4 border-t pt-4">
              <Label htmlFor="testText">Testar Voz</Label>
              <div className="flex gap-2">
                <Input
                  id="testText"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Digite um texto para testar a voz"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleTestVoice}
                  disabled={isPlaying || !apiKey}
                  className="flex-shrink-0 w-10 p-0"
                >
                  {isPlaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-col space-y-2">
            <div className="flex w-full justify-between flex-col sm:flex-row gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={!apiKey || testStatus === 'loading'}
              >
                {testStatus === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : testStatus === 'success' ? (
                  "Teste bem-sucedido"
                ) : testStatus === 'error' ? (
                  "Falha no teste"
                ) : (
                  "Testar Conexão"
                )}
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar e Ativar"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};