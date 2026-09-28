import { Test, TestingModule } from '@nestjs/testing';
import { StudentProfileRepository } from './student-profile.repository';
import { PrismaService } from '@/prisma/prisma.service';

describe('StudentProfileRepository', () => {
  let repository: StudentProfileRepository;
  let prisma: PrismaService;

  const mockPrisma = {
    studentProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentProfileRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<StudentProfileRepository>(StudentProfileRepository);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByUserId', () => {
    it('should query prisma studentProfile with skills included', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      mockPrisma.studentProfile.findUnique.mockResolvedValue({ userId });

      await repository.findByUserId(userId);
      expect(prisma.studentProfile.findUnique).toHaveBeenCalledWith({
        where: { userId },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });
    });
  });

  describe('create', () => {
    it('should create student profile record with default arrays', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const data = {
        academicYear: 2,
        university: 'AAU',
        fieldOfStudy: 'CS',
      };
      mockPrisma.studentProfile.create.mockResolvedValue({ userId, ...data });

      await repository.create(userId, data);
      expect(prisma.studentProfile.create).toHaveBeenCalledWith({
        data: {
          userId,
          academicYear: 2,
          university: 'AAU',
          fieldOfStudy: 'CS',
          location: undefined,
          careerGoals: undefined,
          careerGoalTags: [],
          interests: [],
          isDiscoverable: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update student profile record', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const data = { location: 'Bole, Addis Ababa' };
      mockPrisma.studentProfile.update.mockResolvedValue({ userId, ...data });

      await repository.update(userId, data);
      expect(prisma.studentProfile.update).toHaveBeenCalledWith({
        where: { userId },
        data,
      });
    });
  });
});
