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

  async getSkills(userId: string) {
    return this.prisma.studentSkill.findMany({
      where: {
        studentProfileId: userId,
      },
      include: {
        skill: true,
      },
      orderBy: {
        skill: {
          name: 'asc',
        },
      },
    });
  }

  async addSkill(
    userId: string,
    data: {
      skillId: string;
      proficiency?: number;
      yearsOfExperience?: number;
    },
  ) {
    return this.prisma.studentSkill.upsert({
      where: {
        studentProfileId_skillId: {
          studentProfileId: userId,
          skillId: data.skillId,
        },
      },
      update: {
        proficiency: data.proficiency ?? 3,
        yearsOfExperience: data.yearsOfExperience ? new (require('@prisma/client').Prisma.Decimal)(data.yearsOfExperience) : null,
      },
      create: {
        studentProfileId: userId,
        skillId: data.skillId,
        proficiency: data.proficiency ?? 3,
        yearsOfExperience: data.yearsOfExperience ? new (require('@prisma/client').Prisma.Decimal)(data.yearsOfExperience) : null,
      },
      include: {
        skill: true,
      },
    });
  }

  async removeSkill(userId: string, skillId: string) {
    return this.prisma.studentSkill.delete({
      where: {
        studentProfileId_skillId: {
          studentProfileId: userId,
          skillId,
        },
      },
    });
  }

  async setSkills(userId: string, skillIds: string[]) {
    // Delete existing skills not in list
    await this.prisma.studentSkill.deleteMany({
      where: {
        studentProfileId: userId,
        skillId: {
          notIn: skillIds,
        },
      },
    });

    // Upsert specified skills
    for (const skillId of skillIds) {
      await this.prisma.studentSkill.upsert({
        where: {
          studentProfileId_skillId: {
            studentProfileId: userId,
            skillId,
          },
        },
        update: {},
        create: {
          studentProfileId: userId,
          skillId,
          proficiency: 3,
        },
      });
    }

    return this.getSkills(userId);
  }
}