import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.studentProfile.findUnique({
      where: {
        userId,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  /**
   * Retrieve full student profile, skills with proficiency, experiences, and CVs for AI matching.
   * Single consolidated query to avoid N+1 queries.
   */
  async getStudentMatchingProfile(userId: string) {
    return this.prisma.studentProfile.findUnique({
      where: {
        userId,
      },
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
  }

  async create(
    userId: string,
    data: {
      academicYear: number;
      university: string;
      fieldOfStudy: string;
      location?: string;
      careerGoals?: string;
      careerGoalTags?: string[];
      interests?: string[];
      isDiscoverable?: boolean;
    },
  ) {
    return this.prisma.studentProfile.create({
      data: {
        userId,
        academicYear: data.academicYear,
        university: data.university,
        fieldOfStudy: data.fieldOfStudy,
        location: data.location,
        careerGoals: data.careerGoals,
        careerGoalTags: data.careerGoalTags ?? [],
        interests: data.interests ?? [],
        isDiscoverable: data.isDiscoverable ?? true,
      },
    });
  }
  async update(
    userId: string,
    data: {
      academicYear?: number;
      university?: string;
      fieldOfStudy?: string;
      location?: string;
      careerGoals?: string;
      careerGoalTags?: string[];
      interests?: string[];
      isDiscoverable?: boolean;
    },
  ) {
    return this.prisma.studentProfile.update({
      where: {
        userId,
      },
      data,
    });
  }
}