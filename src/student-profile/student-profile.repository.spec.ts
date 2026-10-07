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

  describe('getStudentMatchingProfile', () => {
    it('should query prisma studentProfile with skills, experiences, and cvs included', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const mockProfile = {
        userId,
        academicYear: 3,
        university: 'Addis Ababa University',
        fieldOfStudy: 'Software Engineering',
        location: 'Addis Ababa',
        interests: ['AI', 'Web Development'],
        careerGoals: 'Full Stack Engineer',
        careerGoalTags: ['Software', 'FullStack'],
        isDiscoverable: true,
        skills: [
          {
            skillId: 's1',
            proficiency: 4,
            yearsOfExperience: 2,
            skill: { id: 's1', name: 'TypeScript', category: 'Programming', description: 'JS with types' },
          },
        ],
        experiences: [
          {
            id: 'e1',
            title: 'Intern',
            organizationName: 'Tech Co',
            experienceType: 'INTERNSHIP',
            startDate: new Date('2025-01-01'),
            endDate: null,
            location: 'Remote',
            description: 'Building APIs',
          },
        ],
        cvs: [
          {
            id: 'c1',
            fileName: 'resume.pdf',
            filePath: 'cvs/resume.pdf',
            fileType: 'application/pdf',
            fileSize: 1024,
            isDefault: true,
            uploadedAt: new Date(),
          },
        ],
      };
      mockPrisma.studentProfile.findUnique.mockResolvedValue(mockProfile);

      const result = await repository.getStudentMatchingProfile(userId);

      expect(result).toEqual(mockProfile);
      expect(prisma.studentProfile.findUnique).toHaveBeenCalledWith({
        where: { userId },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
          experiences: {
            orderBy: {
              startDate: 'desc',
            },
          },
          cvs: {
            orderBy: [{ isDefault: 'desc' }, { uploadedAt: 'desc' }],
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
