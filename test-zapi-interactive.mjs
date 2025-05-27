/**
 * Script para testar a integração com Z-API para mensagens interativas
 * 
 * Este script testa o envio de mensagens com botões e listas de opções
 * usando as credenciais reais da Z-API.
 */

import axios from 'axios';

// Credenciais da Z-API (obtidas das variáveis de ambiente)
const instanceId = process.env.ZAPI_INSTANCE_ID;
const token = process.env.ZAPI_TOKEN;
const clientToken = process.env.CLIENT_TOKEN_ZAPI;

// Número de telefone para teste (substitua pelo número real)
const phoneNumber = '5511999999999'; // Substitua pelo número real para teste

// Função para testar o envio de mensagem com botões
async function testSendButtonMessage() {
  console.log('\n===== Testando envio de mensagem com botões =====');
  
  try {
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-button-list`;
    
    const data = {
      phone: phoneNumber,
      message: 'Esta é uma mensagem de teste com botões',
      buttonList: {
        buttons: [
          { id: 'btn1', label: 'Opção 1' },
          { id: 'btn2', label: 'Opção 2' },
          { id: 'btn3', label: 'Opção 3' }
        ]
      }
    };
    
    console.log('Enviando requisição para:', url);
    console.log('Dados:', JSON.stringify(data, null, 2));
    
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': clientToken
      }
    });
    
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    console.log('✅ Mensagem com botões enviada com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem com botões:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Função para testar o envio de lista de opções
async function testSendOptionList() {
  console.log('\n===== Testando envio de lista de opções =====');
  
  try {
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-option-list`;
    
    const data = {
      phone: phoneNumber,
      title: 'Lista de opções de teste',
      buttonText: 'Ver opções',
      description: 'Selecione uma das opções abaixo',
      sections: [
        {
          title: 'Produtos',
          rows: [
            { id: 'prod1', title: 'Produto 1', description: 'Descrição do produto 1' },
            { id: 'prod2', title: 'Produto 2', description: 'Descrição do produto 2' }
          ]
        },
        {
          title: 'Serviços',
          rows: [
            { id: 'serv1', title: 'Serviço 1', description: 'Descrição do serviço 1' },
            { id: 'serv2', title: 'Serviço 2', description: 'Descrição do serviço 2' }
          ]
        }
      ]
    };
    
    console.log('Enviando requisição para:', url);
    console.log('Dados:', JSON.stringify(data, null, 2));
    
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': clientToken
      }
    });
    
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    console.log('✅ Lista de opções enviada com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar lista de opções:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Função principal para executar todos os testes
async function runTests() {
  console.log('🔍 Iniciando testes de integração com Z-API para mensagens interativas');
  console.log(`Instance ID: ${instanceId ? '✓ configurado' : '✗ não configurado'}`);
  console.log(`Token: ${token ? '✓ configurado' : '✗ não configurado'}`);
  console.log(`Client Token: ${clientToken ? '✓ configurado' : '✗ não configurado'}`);
  
  if (!instanceId || !token || !clientToken) {
    console.error('❌ Credenciais incompletas. Configure as variáveis de ambiente ZAPI_INSTANCE_ID, ZAPI_TOKEN e CLIENT_TOKEN_ZAPI.');
    process.exit(1);
  }
  
  // Executar testes
  const results = {
    buttonMessage: await testSendButtonMessage(),
    optionList: await testSendOptionList()
  };
  
  // Resumo dos resultados
  console.log('\n===== Resumo dos testes =====');
  console.log(`Mensagem com botões: ${results.buttonMessage ? '✅ Sucesso' : '❌ Falha'}`);
  console.log(`Lista de opções: ${results.optionList ? '✅ Sucesso' : '❌ Falha'}`);
  
  // Verificar se todos os testes passaram
  const allPassed = Object.values(results).every(result => result === true);
  if (allPassed) {
    console.log('\n✅ Todos os testes passaram com sucesso!');
  } else {
    console.log('\n❌ Alguns testes falharam. Verifique os logs acima para mais detalhes.');
    process.exit(1);
  }
}

// Executar os testes
runTests().catch(error => {
  console.error('Erro não tratado:', error);
  process.exit(1);
});
