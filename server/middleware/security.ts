import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por windowMs
});

// Configuração do CSP
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.z-api.io"],
    fontSrc: ["'self'", "https:", "data:"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  }
};

export const securityMiddleware = [
  // Helmet para headers de segurança
  helmet(),
  
  // Content Security Policy
  helmet.contentSecurityPolicy(cspConfig),
  
  // Rate Limiting
  limiter,
  
  // Middleware personalizado para headers adicionais
  (req: Request, res: Response, next: NextFunction) => {
    // Prevenir exposição de informações sensíveis
    res.removeHeader('X-Powered-By');
    
    // Headers de segurança adicionais
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevenir cache de respostas com dados sensíveis
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    next();
  }
]; 