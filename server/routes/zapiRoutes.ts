import { Router, Request, Response } from "express";
import { getZapiQRCode, testZapiConnection, sendTextMessage } from "../services/zapiService";

export function registerZapiRoutes(app: Router) {
  // Rota para obter o QR Code da Z-API
  app.post("/api/zapi/get-qrcode", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken } = req.body;
      
      if (!instanceId || !token) {
        return res.status(400).json({
          success: false,
          message: "Instance ID e Token são obrigatórios",
        });
      }
      
      const result = await getZapiQRCode(instanceId, token, clientToken);
      res.json(result);
    } catch (error) {
      console.error("Erro na rota de QR Code:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  });
  
  // Rota para testar a conexão com a Z-API
  app.post("/api/zapi/test-connection", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken } = req.body;
      
      if (!instanceId || !token) {
        return res.status(400).json({
          success: false,
          message: "Instance ID e Token são obrigatórios",
        });
      }
      
      const result = await testZapiConnection(instanceId, token, clientToken);
      res.json(result);
    } catch (error) {
      console.error("Erro na rota de teste de conexão:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  });
  
  // Rota para enviar mensagem de texto via Z-API
  app.post("/api/zapi/send-message", async (req: Request, res: Response) => {
    try {
      const { instanceId, token, clientToken, phone, message } = req.body;
      
      if (!instanceId || !token || !phone || !message) {
        return res.status(400).json({
          success: false,
          message: "Instance ID, Token, número de telefone e mensagem são obrigatórios",
        });
      }
      
      const result = await sendTextMessage(instanceId, token, clientToken, phone, message);
      res.json(result);
    } catch (error) {
      console.error("Erro na rota de envio de mensagem:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      });
    }
  });
}