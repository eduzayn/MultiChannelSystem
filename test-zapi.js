import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';

async function runTests() {
  try {
    console.log('🔍 Iniciando testes de integração com Z-API...');
    
    const instanceId = process.env.ZAPI_INSTANCE_ID;
    const token = process.env.ZAPI_TOKEN;
    const clientToken = process.env.CLIENT_TOKEN_ZAPI;
    
    if (!instanceId || !token) {
      console.error('❌ Credenciais Z-API não encontradas nas variáveis de ambiente');
      process.exit(1);
    }
    
    console.log('✅ Credenciais Z-API encontradas');
    
    const { default: axios } = await import('axios');
    
    console.log('🔍 Testando conexão com Z-API...');
    try {
      const response = await axios.get(
        `https://api.z-api.io/instances/${instanceId}/token/${token}/status`,
        {
          headers: clientToken ? { 'Client-Token': clientToken } : {},
          validateStatus: () => true
        }
      );
      
      console.log(`✅ Status da conexão: ${response.status}`);
      console.log('📊 Resposta:', JSON.stringify(response.data, null, 2));
      
      if (response.status === 200) {
        console.log('✅ Conexão com Z-API estabelecida com sucesso!');
        
        console.log('\n🔍 Testando envio de mensagem de texto...');
        try {
          const textResponse = await axios.post(
            `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
            {
              phone: '5511999999999', // Substitua por um número de teste
              message: 'Teste de integração Z-API - Mensagem enviada pelo sistema corrigido'
            },
            {
              headers: clientToken ? { 'Client-Token': clientToken } : {},
              validateStatus: () => true
            }
          );
          
          console.log(`✅ Status do envio de texto: ${textResponse.status}`);
          console.log('📊 Resposta:', JSON.stringify(textResponse.data, null, 2));
          
          console.log('\n🔍 Testando envio de reação...');
          if (textResponse.data && textResponse.data.messageId) {
            const reactionResponse = await axios.post(
              `https://api.z-api.io/instances/${instanceId}/token/${token}/messages/reaction`,
              {
                phone: '5511999999999', // Substitua por um número de teste
                messageId: textResponse.data.messageId,
                reaction: '👍'
              },
              {
                headers: clientToken ? { 'Client-Token': clientToken } : {},
                validateStatus: () => true
              }
            );
            
            console.log(`✅ Status do envio de reação: ${reactionResponse.status}`);
            console.log('📊 Resposta:', JSON.stringify(reactionResponse.data, null, 2));
          } else {
            console.log('⚠️ Não foi possível testar reação: ID da mensagem não disponível');
          }
        } catch (error) {
          console.error('❌ Erro ao testar funcionalidades:', error.message);
        }
      } else {
        console.error(`❌ Falha na conexão com Z-API: ${response.status}`);
        console.error('📊 Detalhes:', JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  }
}

runTests();
