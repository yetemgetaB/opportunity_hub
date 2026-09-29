import {
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StudentProfileController } from '../../src/student-profile/student-profile.controller';
import { StudentProfileService } from '../../src/student-profile/student-profile.service';
import { StudentProfileRepository } from '../../src/student-profile/student-profile.repository';
import { PrismaService } from '../../src/prisma/prisma.service';
import { SupabaseAuthGuard } from '../../src/auth/guards/supabase-auth.guard';
import { RolesGuard } from '../../src/common/guards/roles.guard';

describe('Student Profile Integration (Controller -> Service -> Repository)', () => {
  let module: TestingModule;
  let controller: StudentProfileController;

  const mockSupabaseAuthGuard: CanActivate = {
    canActivate: (_context: ExecutionContext) => true,
  };

  const mockRolesGuard: CanActivate = {
    canActivate: (_context: ExecutionContext) => true,
  };

  const profiles = new Map<string, any>();

  const mockPrisma = {
    studentProfile: {
      findUnique: jest.fn(
        async ({ where }: { where: { userId: string } }) => {
          const profile = profiles.get(where.userId);

          if (!profile) {
            return null;
          }

          return {
            ...profile,
            skills: profile.skills ?? [],
          };
        },
      ),

      create: jest.fn(
        async ({
          data,
        }: {
          data: {
            userId: string;
            academicYear: number;
            university: string;
            fieldOfStudy: string;
            location?: string;
            careerGoals?: string;
            careerGoalTags?: string[];
            interests?: string[];
            isDiscoverable?: boolean;
          };
        }) => {
          const profile = {
            id: `profile-${data.userId}`,
            ...data,
            skills: [],
          };

          profiles.set(data.userId, profile);

          return profile;
        },
      ),

      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { userId: string };
          data: Record<string, unknown>;
        }) => {
          const existingProfile = profiles.get(where.userId);

          if (!existingProfile) {
            throw new Error('Profile not found');
          }

          const updatedProfile = {
            ...existingProfile,
            ...data,
          };

          profiles.set(where.userId, updatedProfile);

          return updatedProfile;
        },
      ),
    },
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [StudentProfileController],
      providers: [
        StudentProfileService,
        StudentProfileRepository,
        PrismaService,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideGuard(SupabaseAuthGuard)
      .useValue(mockSupabaseAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<StudentProfileController>(
      StudentProfileController,
    );
  });

  beforeEach(() => {
    profiles.clear();

    jest.clearAllMocks();
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Student Profile Create -> Get -> Update Flow', () => {
    it('creates a student profile and then retrieves the same profile', async () => {
      const userId = 'student-user-1';

      const profileData = {
        academicYear: 3,
        university: 'Addis Ababa University',
        fieldOfStudy: 'Computer Science',
        location: 'Addis Ababa',
        careerGoals: 'Become a software engineer',
        careerGoalTags: ['Software Engineering', 'AI'],
        interests: ['Artificial Intelligence', 'Web Development'],
        isDiscoverable: true,
      };

      const createdProfile = await controller.createMyProfile(
        userId,
        profileData,
      );

      const retrievedProfile = await controller.getMyProfile(userId);

      expect(createdProfile).toEqual(retrievedProfile);

      expect(retrievedProfile).toMatchObject({
        userId,
        academicYear: 3,
        university: 'Addis Ababa University',
        fieldOfStudy: 'Computer Science',
        location: 'Addis Ababa',
        careerGoals: 'Become a software engineer',
        careerGoalTags: ['Software Engineering', 'AI'],
        interests: ['Artificial Intelligence', 'Web Development'],
        isDiscoverable: true,
      });
    });

    it('updates an existing student profile and returns the updated data', async () => {
      const userId = 'student-user-2';

      await controller.createMyProfile(userId, {
        academicYear: 2,
        university: 'Addis Ababa University',
        fieldOfStudy: 'Computer Science',
        location: 'Addis Ababa',
        careerGoals: 'Become a developer',
        careerGoalTags: ['Backend'],
        interests: ['Programming'],
        isDiscoverable: true,
      });

      const updatedProfile = await controller.updateMyProfile(userId, {
        academicYear: 4,
        university: 'Addis Ababa University',
        fieldOfStudy: 'Software Engineering',
        location: 'Bahir Dar',
        careerGoals: 'Become an AI engineer',
        careerGoalTags: ['AI', 'Machine Learning'],
        interests: ['Artificial Intelligence'],
        isDiscoverable: false,
      });

      expect(updatedProfile).toMatchObject({
        userId,
        academicYear: 4,
        university: 'Addis Ababa University',
        fieldOfStudy: 'Software Engineering',
        location: 'Bahir Dar',
        careerGoals: 'Become an AI engineer',
        careerGoalTags: ['AI', 'Machine Learning'],
        interests: ['Artificial Intelligence'],
        isDiscoverable: false,
      });

      const retrievedProfile = await controller.getMyProfile(userId);

      expect(retrievedProfile).toEqual(updatedProfile);
    });
  });

  describe('Student Profile Security and Ownership', () => {
    it('does not allow retrieving a profile that does not exist for the authenticated user', async () => {
      const userId = 'student-without-profile';

      await expect(
        controller.getMyProfile(userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('keeps different student profiles separate', async () => {
      const studentOne = 'student-user-1';
      const studentTwo = 'student-user-2';

      await controller.createMyProfile(studentOne, {
        academicYear: 3,
        university: 'Addis Ababa University',
        fieldOfStudy: 'Computer Science',
        location: 'Addis Ababa',
        careerGoals: 'Software Engineer',
        careerGoalTags: ['Backend'],
        interests: ['Programming'],
        isDiscoverable: true,
      });

      await controller.createMyProfile(studentTwo, {
        academicYear: 4,
        university: 'Bahir Dar University',
        fieldOfStudy: 'Information Technology',
        location: 'Bahir Dar',
        careerGoals: 'AI Engineer',
        careerGoalTags: ['AI'],
        interests: ['Machine Learning'],
        isDiscoverable: true,
      });

      const profileOne = await controller.getMyProfile(studentOne);
      const profileTwo = await controller.getMyProfile(studentTwo);

      expect(profileOne.userId).toBe(studentOne);
      expect(profileTwo.userId).toBe(studentTwo);

      expect(profileOne.fieldOfStudy).toBe('Computer Science');
      expect(profileTwo.fieldOfStudy).toBe('Information Technology');

      expect(profileOne.university).toBe(
        'Addis Ababa University',
      );
      expect(profileTwo.university).toBe(
        'Bahir Dar University',
      );
    });
  });

  describe('Student Profile Business Rules', () => {
    it('rejects creating a second profile for the same student', async () => {
      const userId = 'student-user-duplicate';

      const profileData = {
        academicYear: 3,
        university: 'Addis Ababa University',
        fieldOfStudy: 'Computer Science',
        location: 'Addis Ababa',
        careerGoals: 'Software Engineer',
        careerGoalTags: ['Backend'],
        interests: ['Programming'],
        isDiscoverable: true,
      };

      await controller.createMyProfile(
        userId,
        profileData,
      );

      await expect(
        controller.createMyProfile(
          userId,
          profileData,
        ),
      ).rejects.toThrow(
        'Student profile already exists.',
      );
    });

    it('rejects updating a profile that does not exist', async () => {
      const userId = 'student-user-missing';

      await expect(
        controller.updateMyProfile(userId, {
          academicYear: 4,
          fieldOfStudy: 'Software Engineering',
        }),
      ).rejects.toThrow(
        'Student profile not found.',
      );
    });
  });
});