import React, { useState } from 'react';
import { testZapiConnection, getZapiQRCode } from '../services/zapiTester';
import { SimpleQRCode } from './SimpleQRCode';

/**
 * Componente para testar a conexão com a Z-API
 */
export function ZapiConnectionTester() {
  const [instanceId, setInstanceId] = useState('');
  const [token, setToken] = useState('');
  const [clientToken, setClientToken] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [qrCodeError, setQrCodeError] = useState<string | null>(null);
  
  const handleTestConnection = async () => {
    if (!instanceId || !token || !clientToken) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const result = await testZapiConnection(instanceId, token, clientToken);
      setTestResult(result);
      console.log('Resultado do teste de conexão:', result);
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setTestResult({
        success: false,
        message: 'Erro ao conectar com a Z-API'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGetQRCode = async () => {
    if (!instanceId || !token || !clientToken) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    setQrCodeData(null);
    setQrCodeError(null);
    
    try {
      const result = await getZapiQRCode(instanceId, token, clientToken);
      
      if (result.success && result.qrCode) {
        setQrCodeData(result.qrCode);
        console.log('QR Code obtido com sucesso');
      } else {
        setQrCodeError(result.message || 'Não foi possível obter o QR Code');
        console.error('Erro ao obter QR Code:', result.message);
      }
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      setQrCodeError('Erro ao obter QR Code da Z-API');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Teste de Conexão Z-API</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID da Instância
          </label>
          <input
            type="text"
            value={instanceId}
            onChange={(e) => setInstanceId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Ex: 1A2B3C4D5E6F7G8H9I0J"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token da Instância
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Ex: abcde12345-abcde12345-abcde12345"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client Token
          </label>
          <input
            type="text"
            value={clientToken}
            onChange={(e) => setClientToken(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Ex: 1a2b3c4d5e6f7g8h9i0j"
          />
        </div>
      </div>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleTestConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Testando...' : 'Testar Conexão'}
        </button>
        
        <button
          onClick={handleGetQRCode}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Obtendo...' : 'Obter QR Code'}
        </button>
      </div>
      
      {testResult && (
        <div className={`p-4 rounded-md mb-4 ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className={`font-medium ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {testResult.success ? 'Conexão bem-sucedida!' : 'Falha na conexão'}
          </h3>
          <p className={`text-sm mt-1 ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
            {testResult.message}
          </p>
        </div>
      )}
      
      {qrCodeData && (
        <div className="mt-6">
          <h3 className="font-medium text-gray-700 mb-3">QR Code para Conexão</h3>
          <div className="flex justify-center p-4 bg-white border rounded-md">
            <SimpleQRCode qrCodeData={qrCodeData} size={250} isImageQRCode={true} />
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Escaneie este código com o WhatsApp para conectar
          </p>
        </div>
      )}
      
      {qrCodeError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mt-6">
          <h3 className="font-medium text-red-700">Erro ao obter QR Code</h3>
          <p className="text-sm text-red-600 mt-1">{qrCodeError}</p>
        </div>
      )}
    </div>
  );
}