import './config'; // Importar configuração primeiro para carregar variáveis de ambiente
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./db-init";
import session from "express-session";
import MemoryStore from "memorystore";
import { socketService } from "./services/socketService";
import { channelMonitorService } from "./services/channelMonitorService";
import { securityMiddleware } from './middleware/security';
import { config } from './config';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Aplicar middlewares de segurança primeiro
app.use(securityMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Configuração de sessão
const MemoryStoreSession = MemoryStore(session);
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: config.session.maxAge },
  store: new MemoryStoreSession({
    checkPeriod: config.session.maxAge // limpa as sessões expiradas a cada 24 horas
  })
}));

process.on('uncaughtException', (error) => {
  log('Erro não capturado: ' + (error instanceof Error ? error.message : String(error)));
});

process.on('unhandledRejection', (reason, promise) => {
  log('Rejeição de promessa não tratada: ' + (reason instanceof Error ? reason.message : String(reason)));
});

(async () => {
  // Inicializar o banco de dados com dados iniciais (se necessário)
  try {
    await initializeDatabase();
    log("Banco de dados inicializado com sucesso");
  } catch (error) {
    if (error instanceof Error) {
      log("Erro ao inicializar o banco de dados: " + error.message);
    } else {
      log("Erro desconhecido ao inicializar o banco de dados");
    }
  }
  
  // Registrar rotas e obter o servidor HTTP
  const server = await registerRoutes(app);
  
  // Inicializar o serviço de Socket.IO com o servidor HTTP
  socketService.init(server);
  
  // Iniciar o serviço de monitoramento de canais
  channelMonitorService.start();
  
  // Iniciar monitoramento de saúde do sistema após 5 segundos
  setTimeout(() => {
    try {
      const { healthCheckService } = require('./services/healthCheckService');
      healthCheckService.startHealthCheck(60000); // Verificar a cada 1 minuto
      log("Serviço de monitoramento de saúde iniciado");
    } catch (error) {
      log("Aviso: Serviço de monitoramento de saúde não pôde ser iniciado: " + (error instanceof Error ? error.message : String(error)));
    }
  }, 5000);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
