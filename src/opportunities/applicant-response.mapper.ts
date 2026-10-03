import { OpportunityApplicant } from './opportunities.interface';

export function mapApplicantForResponse(
  applicant: OpportunityApplicant,
) {
  return {
    application: {
      id: applicant.id,
      status: applicant.status,
      appliedAt: applicant.appliedAt,
      updatedAt: applicant.updatedAt,
    },

    student: {
      id: applicant.studentProfile.user.id,
      firstName: applicant.studentProfile.user.firstName,
      middleName: applicant.studentProfile.user.middleName,
      lastName: applicant.studentProfile.user.lastName,
      avatarUrl: applicant.studentProfile.user.avatarUrl,

      profile: {
        academicYear: applicant.studentProfile.academicYear,
        university: applicant.studentProfile.university,
        fieldOfStudy: applicant.studentProfile.fieldOfStudy,
        location: applicant.studentProfile.location,
        careerGoals: applicant.studentProfile.careerGoals,
        careerGoalTags: applicant.studentProfile.careerGoalTags,
        interests: applicant.studentProfile.interests,
      },

      skills: applicant.studentProfile.skills.map((item) => ({
        skillId: item.skill.id,
        name: item.skill.name,
        category: item.skill.category,
        description: item.skill.description,
        proficiency: item.proficiency,
        yearsOfExperience: item.yearsOfExperience,
      })),

      experiences: applicant.studentProfile.experiences.map(
        (experience) => ({
          id: experience.id,
          title: experience.title,
          organizationName: experience.organizationName,
          experienceType: experience.experienceType,
          startDate: experience.startDate,
          endDate: experience.endDate,
          location: experience.location,
          description: experience.description,
        }),
      ),

      cvs: applicant.studentProfile.cvs.map((cv) => ({
        id: cv.id,
        fileName: cv.fileName,
        fileType: cv.fileType,
        fileSize: cv.fileSize,
        isDefault: cv.isDefault,
        uploadedAt: cv.uploadedAt,
      })),
    },
  };
}