import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCodeData: string | null;
  title?: string;
  description?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  open,
  onOpenChange,
  qrCodeData,
  title = "Conecte seu WhatsApp",
  description = "Escaneie o QR Code abaixo com seu WhatsApp para conectar"
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        {qrCodeData ? (
          <div className="flex flex-col items-center p-6 rounded-md gap-6">
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
              {/* Renderização direta do QR Code em tamanho ampliado */}
              <QRCodeSVG 
                value={qrCodeData} 
                size={350}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
                includeMargin={true}
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Ou insira o código manualmente</h3>
              <div className="bg-gray-50 p-4 rounded-md font-mono text-center break-all max-w-xl border border-gray-200">
                {qrCodeData?.substring(0, 200)}
                {qrCodeData && qrCodeData.length > 200 ? '...' : ''}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                No WhatsApp, vá em Configurações &gt; Dispositivos Conectados &gt; Parear usando código
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};