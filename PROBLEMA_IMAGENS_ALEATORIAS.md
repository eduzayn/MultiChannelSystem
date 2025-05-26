# PROBLEMA CRÍTICO: Sistema enviando imagens aleatórias

## Descrição do Problema
O sistema está enviando `https://picsum.photos/400/300` (imagens aleatórias) em vez da imagem real selecionada pelo usuário. Isso é um risco de segurança grave.

## Evidência nos Logs
```
1748296632422.0 - ["Upload concluído, URL da imagem:","https://picsum.photos/400/300"]
```

## Arquivos Envolvidos

### 1. Frontend - Upload e Envio de Imagens
- `client/src/modules/Inbox/index.tsx` (linha 542-684)
  - Função `handleSendAttachment()` - responsável pelo upload e envio

### 2. Backend - Rota de Upload
- `server/routes.ts` (linha 596-671)
  - Rota `POST /api/upload` - processamento do upload de imagens

### 3. Backend - Rota de Envio de Mensagens
- `server/routes.ts` (linha 673-850)
  - Rota `POST /api/messages/send` - envio via Z-API

### 4. Serviço Z-API
- `server/services/zapiService.ts` (linha 1009-1100)
  - Função `sendImage()` - interface com a API Z-API

### 5. Configuração do Servidor
- `server/routes.ts` (linha 63-73)
  - Configuração de middleware para arquivos estáticos

## Fluxo Esperado vs Atual

### Fluxo Esperado:
1. Usuário seleciona imagem real
2. Upload salva imagem no servidor `/uploads/`
3. Gera URL real: `https://domain.com/uploads/filename.png`
4. Envia URL real para Z-API
5. WhatsApp recebe imagem real

### Fluxo Atual (PROBLEMA):
1. Usuário seleciona imagem real ✓
2. Upload deveria salvar imagem ❌
3. Sistema retorna URL falsa: `https://picsum.photos/400/300` ❌
4. Envia URL falsa para Z-API ❌
5. WhatsApp recebe imagem aleatória ❌

## Logs Críticos Adicionados
- Upload: `✅ UPLOAD REAL - Arquivo salvo: ${filepath}`
- Envio: `🚨 CRITICAL CHECK - URL da imagem recebida: ${imageUrl}`

## Próximos Passos
1. Verificar se a rota `/api/upload` está realmente salvando a imagem
2. Verificar se a URL gerada é válida e acessível
3. Garantir que a URL real seja passada para a Z-API
4. Testar se `/uploads/` está servindo arquivos corretamente

## Impacto
- **CRÍTICO**: Usuários estão enviando imagens aleatórias em vez das suas próprias imagens
- **SEGURANÇA**: Violação de privacidade e dados
- **CONFIANÇA**: Sistema não funciona como esperado