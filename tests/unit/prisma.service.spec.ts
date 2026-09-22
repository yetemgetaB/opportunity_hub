import { PrismaService } from '../../src/prisma/prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = new PrismaService();
  });

  afterEach(async () => {
    // cleanup
  });

  it('should be defined and instantiate PrismaClient', () => {
    expect(prismaService).toBeDefined();
    expect(prismaService.$connect).toBeDefined();
    expect(prismaService.$disconnect).toBeDefined();
    expect(prismaService.user).toBeDefined();
    expect(prismaService.studentProfile).toBeDefined();
    expect(prismaService.opportunity).toBeDefined();
    expect(prismaService.application).toBeDefined();
    expect(prismaService.assessment).toBeDefined();
  });

  it('should handle checkHealth gracefully when disconnected', async () => {
    jest.spyOn(prismaService, '$queryRawUnsafe').mockRejectedValueOnce(new Error('Connection refused'));
    const health = await prismaService.checkHealth();
    expect(health.isHealthy).toBe(false);
    expect(health.error).toContain('Connection refused');
  });

  it('should report healthy when queryRaw succeeds', async () => {
    jest.spyOn(prismaService, '$queryRawUnsafe').mockResolvedValueOnce([{ '?column?': 1 }]);
    const health = await prismaService.checkHealth();
    expect(health.isHealthy).toBe(true);
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
