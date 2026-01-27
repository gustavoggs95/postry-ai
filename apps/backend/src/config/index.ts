import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};
