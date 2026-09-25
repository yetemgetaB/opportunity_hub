import { DatabaseHealthService } from '../../src/database/database.health.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('DatabaseHealthService', () => {
  let service: DatabaseHealthService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      checkHealth: jest.fn(),
    };
    service = new DatabaseHealthService(mockPrisma as unknown as PrismaService);
  });

  it('should return connected status when prisma check succeeds', async () => {
    mockPrisma.checkHealth.mockResolvedValue({
      isHealthy: true,
      latencyMs: 12,
    });

    const result = await service.checkConnection();
    expect(result.status).toBe('connected');
    expect(result.database).toBe('Supabase PostgreSQL');
    expect(result.latencyMs).toBe(12);
  });

  it('should return disconnected status with error details when check fails', async () => {
    mockPrisma.checkHealth.mockResolvedValue({
      isHealthy: false,
      error: 'Tenant database paused or unreachable',
    });

    const result = await service.checkConnection();
    expect(result.status).toBe('disconnected');
    expect(result.error).toContain('Tenant database paused or unreachable');
  });
});
