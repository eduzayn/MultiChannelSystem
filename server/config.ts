import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const requiredEnvVars = [
  'DATABASE_URL',
  'SESSION_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`⚠️ Variáveis de ambiente ausentes: ${missingEnvVars.join(', ')}`);
  
  if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'development') {
    process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/multichannel';
    console.log('⚠️ Usando URL de banco de dados padrão para desenvolvimento');
  }
  
  if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'development') {
    process.env.SESSION_SECRET = 'development_secret_key_for_testing_only';
    console.log('⚠️ Usando chave de sessão padrão para desenvolvimento');
  }
}

export const config = {
  database: {
    url: process.env.DATABASE_URL
  },
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    env: process.env.NODE_ENV || 'development'
  },
  session: {
    secret: process.env.SESSION_SECRET || 'security-crm-secret',
    maxAge: 86400000 // 24 horas
  },
  zapi: {
    token: process.env.ZAPI_TOKEN,
    instanceId: process.env.ZAPI_INSTANCE_ID,
    clientToken: process.env.CLIENT_TOKEN_ZAPI
  }
};
