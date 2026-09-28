import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationProfileRepository } from './organization-profile.repository';
import { PrismaService } from '@/prisma/prisma.service';

describe('OrganizationProfileRepository', () => {
  let repository: OrganizationProfileRepository;
  let prisma: PrismaService;

  const mockPrisma = {
    organizationMember: {
      findFirst: jest.fn(),
    },
    organization: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationProfileRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<OrganizationProfileRepository>(
      OrganizationProfileRepository,
    );
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByUserId', () => {
    it('should query prisma organizationMember with organization relation included', async () => {
      const userId = '22222222-2222-2222-2222-222222222222';
      mockPrisma.organizationMember.findFirst.mockResolvedValue({
        userId,
        organizationId: 'org-123',
      });

      await repository.findByUserId(userId);
      expect(prisma.organizationMember.findFirst).toHaveBeenCalledWith({
        where: { userId },
        include: {
          organization: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update organization record by organizationId', async () => {
      const organizationId = 'org-123';
      const data = {
        name: 'New Organization Name',
        description: 'New Description',
      };
      mockPrisma.organization.update.mockResolvedValue({
        id: organizationId,
        ...data,
      });

      await repository.update(organizationId, data);
      expect(prisma.organization.update).toHaveBeenCalledWith({
        where: { id: organizationId },
        data,
      });
    });
  });
});
