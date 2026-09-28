import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrganizationProfileService } from './organization-profile.service';
import { OrganizationProfileRepository } from './organization-profile.repository';

describe('OrganizationProfileService', () => {
  let service: OrganizationProfileService;
  let repository: OrganizationProfileRepository;

  const mockRepository = {
    findByUserId: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationProfileService,
        {
          provide: OrganizationProfileRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrganizationProfileService>(
      OrganizationProfileService,
    );
    repository = module.get<OrganizationProfileRepository>(
      OrganizationProfileRepository,
    );
    jest.clearAllMocks();
  });

  describe('getMyProfile', () => {
    it('should return organization profile when user has active membership', async () => {
      const userId = '22222222-2222-2222-2222-222222222222';
      const mockMembership = {
        userId,
        organizationId: 'org-123',
        organization: {
          id: 'org-123',
          name: 'Tech Ventures',
          description: 'Software solutions',
          websiteUrl: 'https://tech.example.com',
          contactEmail: 'contact@tech.example.com',
          contactPhone: '+251911223344',
          verificationStatus: 'PENDING',
        },
      };

      mockRepository.findByUserId.mockResolvedValue(mockMembership);

      const result = await service.getMyProfile(userId);
      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockMembership.organization);
    });

    it('should throw NotFoundException when user has no organization membership', async () => {
      const userId = 'non-member-user';
      mockRepository.findByUserId.mockResolvedValue(null);

      await expect(service.getMyProfile(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateMyProfile', () => {
    it('should update organization via membership organizationId', async () => {
      const userId = '22222222-2222-2222-2222-222222222222';
      const mockMembership = {
        userId,
        organizationId: 'org-123',
        organization: { id: 'org-123', name: 'Tech Ventures' },
      };
      const dto = {
        name: 'Tech Ventures Global',
        description: 'Global software solutions',
      };
      const updatedOrg = {
        id: 'org-123',
        ...dto,
      };

      mockRepository.findByUserId.mockResolvedValue(mockMembership);
      mockRepository.update.mockResolvedValue(updatedOrg);

      const result = await service.updateMyProfile(userId, dto);
      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
      expect(repository.update).toHaveBeenCalledWith('org-123', dto);
      expect(result).toEqual(updatedOrg);
    });

    it('should throw NotFoundException when updating without organization membership', async () => {
      const userId = 'non-member-user';
      mockRepository.findByUserId.mockResolvedValue(null);

      await expect(
        service.updateMyProfile(userId, { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
