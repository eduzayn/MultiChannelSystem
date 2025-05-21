import React from 'react';
import { ZapiConnectionTester } from '../components/ZapiConnectionTester';

export default function ZapiTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Teste de Integração Z-API</h1>
      <p className="text-center text-gray-600 mb-8">
        Use esta página para testar a integração com a Z-API e verificar se suas credenciais estão corretas.
      </p>
      <div className="max-w-3xl mx-auto">
        <ZapiConnectionTester />
      </div>
    </div>
  );
}