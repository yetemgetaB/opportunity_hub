import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  databaseUrl: string;
  directUrl?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceRoleKey?: string;
  isProduction: boolean;
}

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    databaseUrl:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/postgres',
    directUrl: process.env.DIRECT_URL,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    isProduction: process.env.NODE_ENV === 'production',
  }),
);
