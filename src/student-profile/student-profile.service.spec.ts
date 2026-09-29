import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { StudentProfileService } from './student-profile.service';
import { StudentProfileRepository } from './student-profile.repository';

describe('StudentProfileService', () => {
  let service: StudentProfileService;
  let repository: StudentProfileRepository;

  const mockRepository = {
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentProfileService,
        {
          provide: StudentProfileRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StudentProfileService>(StudentProfileService);
    repository = module.get<StudentProfileRepository>(StudentProfileRepository);
    jest.clearAllMocks();
  });

  describe('getMyProfile', () => {
    it('should return profile when profile exists', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const profile = { userId, university: 'AAU', fieldOfStudy: 'CS', academicYear: 3 };
      mockRepository.findByUserId.mockResolvedValue(profile);

      const result = await service.getMyProfile(userId);
      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(profile);
    });

    it('should throw NotFoundException when profile does not exist', async () => {
      const userId = 'non-existent-user';
      mockRepository.findByUserId.mockResolvedValue(null);

      await expect(service.getMyProfile(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createMyProfile', () => {
    it('should create and return new profile when no existing profile exists', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const dto = {
        academicYear: 3,
        university: 'AAU',
        fieldOfStudy: 'Computer Science',
      };
      const created = { userId, ...dto };

      mockRepository.findByUserId.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(created);

      const result = await service.createMyProfile(userId, dto);
      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
      expect(repository.create).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual(created);
    });

    it('should throw ConflictException (409) when profile already exists', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const existing = { userId, university: 'AAU', fieldOfStudy: 'CS', academicYear: 3 };
      const dto = {
        academicYear: 4,
        university: 'AAU',
        fieldOfStudy: 'Computer Science',
      };

      mockRepository.findByUserId.mockResolvedValue(existing);

      await expect(service.createMyProfile(userId, dto)).rejects.toThrow(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateMyProfile', () => {
    it('should update and return profile when profile exists', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const existing = { userId, university: 'AAU', fieldOfStudy: 'CS', academicYear: 3 };
      const dto = { academicYear: 4 };
      const updated = { ...existing, academicYear: 4 };

      mockRepository.findByUserId.mockResolvedValue(existing);
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.updateMyProfile(userId, dto);
      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
      expect(repository.update).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when updating non-existent profile', async () => {
      const userId = 'non-existent-user';
      mockRepository.findByUserId.mockResolvedValue(null);

      await expect(service.updateMyProfile(userId, { academicYear: 4 })).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
