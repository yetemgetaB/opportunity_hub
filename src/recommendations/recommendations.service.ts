import { Injectable } from '@nestjs/common';
import { SkillRequirementLevel } from '@prisma/client';

import { StudentProfileRepository } from '@/student-profile/student-profile.repository';
import { OpportunitiesService } from '@/opportunities/opportunities.service';
import { SearchOpportunityDto } from '@/opportunities/dto/search-opportunity.dto';
import { OpportunityWithRelations } from '@/opportunities/opportunities.interface';

export interface RecommendationResult {
  opportunity: OpportunityWithRelations;
  score: number;
  matchedSkills: string[];
  matchedInterests: string[];
}

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly studentProfileRepository: StudentProfileRepository,
    private readonly opportunitiesService: OpportunitiesService,
  ) {}

  async getRecommendations(
    userId: string,
    query?: SearchOpportunityDto,
  ): Promise<RecommendationResult[]> {
    const student =
      await this.studentProfileRepository.findByUserId(userId);

    if (!student) {
      return [];
    }

    const opportunities =
      await this.opportunitiesService.searchOpportunitiesForMatching(
        query ?? {},
      );

    return opportunities
      .map((opportunity) =>
        this.calculateMatch(student, opportunity),
      )
      .sort((a, b) => b.score - a.score);
  }

  private calculateMatch(
    student: any,
    opportunity: OpportunityWithRelations,
  ): RecommendationResult {
    const skillResult = this.calculateSkillMatch(
      student,
      opportunity,
    );

    const fieldScore = this.calculateFieldMatch(
      student,
      opportunity,
    );

    const interestResult = this.calculateInterestMatch(
      student,
      opportunity,
    );

    const academicYearScore =
      this.calculateAcademicYearMatch(
        student,
        opportunity,
      );

    const locationScore =
      this.calculateLocationMatch(
        student,
        opportunity,
      );

    /*
     * Initial matching weights.
     *
     * These are implementation choices for the first version,
     * not official product requirements.
     */
    const score =
      skillResult.score * 0.35 +
      fieldScore * 0.2 +
      interestResult.score * 0.15 +
      academicYearScore * 0.15 +
      locationScore * 0.15;

    return {
      opportunity,
      score: Math.round(score * 100) / 100,
      matchedSkills: skillResult.matchedSkills,
      matchedInterests: interestResult.matchedInterests,
    };
  }

  private calculateSkillMatch(
    student: any,
    opportunity: OpportunityWithRelations,
  ): {
    score: number;
    matchedSkills: string[];
  } {
    const studentSkillIds = new Set(
      student.skills.map(
        (studentSkill) => studentSkill.skillId,
      ),
    );

    const opportunitySkills = opportunity.skills;

    if (opportunitySkills.length === 0) {
      return {
        score: 1,
        matchedSkills: [],
      };
    }

    const requiredSkills = opportunitySkills.filter(
      (skill) =>
        skill.requirementLevel ===
        SkillRequirementLevel.REQUIRED,
    );

    const skillsToCompare =
      requiredSkills.length > 0
        ? requiredSkills
        : opportunitySkills;

    const matchedSkills = skillsToCompare
      .filter((opportunitySkill) =>
        studentSkillIds.has(
          opportunitySkill.skillId,
        ),
      )
      .map(
        (opportunitySkill) =>
          opportunitySkill.skill.name,
      );

    return {
      score:
        matchedSkills.length /
        skillsToCompare.length,
      matchedSkills,
    };
  }

  private calculateFieldMatch(
    student: any,
    opportunity: OpportunityWithRelations,
  ): number {
    if (opportunity.eligibleFields.length === 0) {
      return 1;
    }

    const studentField =
      student.fieldOfStudy.trim().toLowerCase();

    return opportunity.eligibleFields.some(
      (field) =>
        field.trim().toLowerCase() ===
        studentField,
    )
      ? 1
      : 0;
  }

  private calculateInterestMatch(
    student: any,
    opportunity: OpportunityWithRelations,
  ): {
    score: number;
    matchedInterests: string[];
  } {
    const studentInterests: string[] =
      student.interests ?? [];

    if (studentInterests.length === 0) {
      return {
        score: 0,
        matchedInterests: [],
      };
    }

    /*
     * Opportunities do not currently have a dedicated
     * interests field in the schema.
     *
     * We therefore use the opportunity title and
     * description as the first-version text signal
     * for the student's interests.
     */
    const opportunityText =
      `${opportunity.title} ${opportunity.description}`
        .toLowerCase();

    const matchedInterests =
      studentInterests.filter((interest) =>
        opportunityText.includes(
          interest.trim().toLowerCase(),
        ),
      );

    return {
      score:
        matchedInterests.length /
        studentInterests.length,
      matchedInterests,
    };
  }

  private calculateAcademicYearMatch(
    student: any,
    opportunity: OpportunityWithRelations,
  ): number {
    const year = student.academicYear;

    if (
      opportunity.minimumAcademicYear !== null &&
      year < opportunity.minimumAcademicYear
    ) {
      return 0;
    }

    if (
      opportunity.maximumAcademicYear !== null &&
      year > opportunity.maximumAcademicYear
    ) {
      return 0;
    }

    return 1;
  }

  private calculateLocationMatch(
    student: any,
    opportunity: OpportunityWithRelations,
  ): number {
    if (opportunity.isRemote) {
      return 1;
    }

    if (
      !student.location ||
      !opportunity.location
    ) {
      return 0;
    }

    return student.location
        .trim()
        .toLowerCase() ===
      opportunity.location
        .trim()
        .toLowerCase()
      ? 1
      : 0;
  }
}