import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AssessmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAssessment(
    opportunityId: string,
    title: string,
    instructions?: string,
    timeLimitMinutes?: number,
  ) {
    return this.prisma.assessment.create({
      data: {
        opportunityId,
        title,
        instructions,
        timeLimitMinutes,
      },
    });
  }

  async getAssessment(assessmentId: string) {
    return this.prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: {
        questions: {
            orderBy: {
            questionOrder: 'asc',
            },
        },
        },
    });
    }

   async getAssessmentQuestions(assessmentId: string) {
    return this.prisma.assessmentQuestion.findMany({
        where: {
        assessmentId,
        },
        orderBy: {
        questionOrder: 'asc',
        },
    });
    }
}