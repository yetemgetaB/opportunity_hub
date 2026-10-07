import { ApplicantAnalysisData } from './assessments.interface';

import { ApplicantAnalysisInput } from './assessment-analysis.interface';

export function mapApplicantAnalysisData(
  data: ApplicantAnalysisData,
  cvText: string | null = null,
): ApplicantAnalysisInput {
  const studentProfile = data.studentProfile;
  const opportunity = data.opportunity;
  const assessmentAttempt = data.assessmentAttempt;

  return {
    applicantId: studentProfile.userId,
    applicationId: data.id,
    opportunityId: opportunity.id,

    applicant: {
      profile: {
        academicYear: studentProfile.academicYear,
        university: studentProfile.university,
        fieldOfStudy: studentProfile.fieldOfStudy,
        location: studentProfile.location,
        careerGoals: studentProfile.careerGoals,
        careerGoalTags: studentProfile.careerGoalTags,
        interests: studentProfile.interests,
      },

      skills: studentProfile.skills.map((studentSkill) => ({
        name: studentSkill.skill.name,
        category: studentSkill.skill.category,
        proficiency: studentSkill.proficiency,
        yearsOfExperience:
          studentSkill.yearsOfExperience === null
            ? null
            : Number(studentSkill.yearsOfExperience),
      })),

      experiences: studentProfile.experiences.map((experience) => ({
        title: experience.title,
        organizationName: experience.organizationName,
        experienceType: experience.experienceType,
        startDate: experience.startDate,
        endDate: experience.endDate,
        location: experience.location,
        description: experience.description,
      })),

      cvs: studentProfile.cvs.map((cv) => ({
        fileName: cv.fileName,
        filePath: cv.filePath,
        fileType: cv.fileType,
        isDefault: cv.isDefault,
        uploadedAt: cv.uploadedAt,
      })),

      cvText,
    },

    opportunity: {
      title: opportunity.title,
      description: opportunity.description,
      opportunityType: opportunity.opportunityType,
      location: opportunity.location,
      isRemote: opportunity.isRemote,

      minimumAcademicYear: opportunity.minimumAcademicYear,
      maximumAcademicYear: opportunity.maximumAcademicYear,

      minimumGpa:
        opportunity.minimumGpa === null
          ? null
          : Number(opportunity.minimumGpa),

      eligibleFields: opportunity.eligibleFields,

      requiredSkills: opportunity.skills.map((opportunitySkill) => ({
        name: opportunitySkill.skill.name,
        category: opportunitySkill.skill.category,
        requirementLevel: opportunitySkill.requirementLevel,
      })),
    },

    assessment: {
      questions:
        assessmentAttempt?.assessment.questions.map((question) => ({
          id: question.id,
          questionText: question.questionText,
          questionType: question.questionType,
          questionOrder: question.questionOrder,
          options: question.options,
          referenceAnswer: question.referenceAnswer,
          evaluationGuidance: question.evaluationGuidance,
          requirementLevel: question.requirementLevel,
        })) ?? [],

      answers:
        assessmentAttempt?.answers.map((answer) => ({
          questionId: answer.assessmentQuestionId,
          questionText: answer.question.questionText,
          answerText: answer.answerText,
          questionOrder: answer.question.questionOrder,
        })) ?? [],
    },
  };
}