import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  database: {
    url: process.env.DATABASE_URL || '',
  },
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  session: {
    secret: process.env.SESSION_SECRET || 'security-crm-secret',
    maxAge: 86400000, // 24 horas
  },
  zapi: {
    token: process.env.ZAPI_TOKEN || '',
    instanceId: process.env.ZAPI_INSTANCE_ID || '',
    clientToken: process.env.CLIENT_TOKEN_ZAPI || '',
  }
};
