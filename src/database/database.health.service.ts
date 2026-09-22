import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DatabaseHealthService {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Safe, non-destructive check of database connectivity and model access.
   */
  async checkConnection(): Promise<{
    status: 'connected' | 'disconnected';
    database: string;
    latencyMs?: number;
    error?: string;
  }> {
    const health = await this.prisma.checkHealth();
    if (health.isHealthy) {
      return {
        status: 'connected',
        database: 'Supabase PostgreSQL',
        latencyMs: health.latencyMs,
      };
    } else {
      return {
        status: 'disconnected',
        database: 'Supabase PostgreSQL',
        error: health.error,
      };
    }
  }
}
