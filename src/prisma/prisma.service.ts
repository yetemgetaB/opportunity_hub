import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to Supabase PostgreSQL database via Prisma.');
    } catch (error: any) {
      this.logger.warn(
        `Prisma could not establish direct database connection on initialization: ${error.message}. ` +
          'Verify DATABASE_URL and network reachability.',
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma database connection closed.');
  }

  /**
   * Safe, non-destructive healthcheck to verify database connectivity.
   */
  async checkHealth(): Promise<{ isHealthy: boolean; latencyMs?: number; error?: string }> {
    const start = Date.now();
    try {
      await this.$queryRawUnsafe('SELECT 1');
      const latencyMs = Date.now() - start;
      return { isHealthy: true, latencyMs };
    } catch (error: any) {
      return {
        isHealthy: false,
        error: error.message || 'Database ping failed',
      };
    }
  }
}
