import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

import {
  ApplicantAnalysisInput,
  ApplicantAnalysisOutput,
} from './assessment-analysis.interface';

@Injectable()
export class AIApplicantAnalysisService {
  private readonly ai: GoogleGenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ai.apiKey');

    this.model =
      this.configService.get<string>('ai.model') ||
      'gemini-3.8-flash';

    if (!apiKey) {
      throw new Error('AI_API_KEY is not configured.');
    }

    this.ai = new GoogleGenAI({
      apiKey,
    });
  }

  async analyzeApplicant(
    input: ApplicantAnalysisInput,
  ): Promise<ApplicantAnalysisOutput> {
    const prompt = this.buildPrompt(input);

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              applicantId: {
                type: 'string',
              },
              applicationId: {
                type: 'string',
              },
              opportunityId: {
                type: 'string',
              },
              overallScore: {
                type: ['integer', 'null'],
              },
              requirementMatch: {
                type: ['string', 'null'],
              },
              skillAnalysis: {
                type: ['object', 'null'],
              },
              strengths: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              gaps: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              summary: {
                type: ['string', 'null'],
              },
            },
            required: [
              'applicantId',
              'applicationId',
              'opportunityId',
              'overallScore',
              'requirementMatch',
              'skillAnalysis',
              'strengths',
              'gaps',
              'summary',
            ],
          },
        },
      });

      const text = response.text;

      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      let result: ApplicantAnalysisOutput;

      try {
        result = JSON.parse(text) as ApplicantAnalysisOutput;
      } catch {
        throw new InternalServerErrorException(
          'AI returned an invalid applicant analysis response.',
        );
      }

      return this.validateResponse(result, input);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to analyze applicant with AI.',
      );
    }
  }

  private buildPrompt(input: ApplicantAnalysisInput): string {
    const cvSection = input.applicant.cvText
      ? input.applicant.cvText
      : 'CV CONTENT IS NOT AVAILABLE. Do not infer applicant skills, experience, education, or achievements from CV metadata.';

    return `
You are an applicant evaluation assistant.

Analyze the applicant ONLY using the evidence provided below.

Your task is to evaluate how well the applicant matches the opportunity requirements and how well they performed in the assessment.

IMPORTANT RULES:
- Do not invent applicant skills, experience, education, achievements, or qualifications.
- Do not infer information that is not explicitly supported by the provided data.
- Do not treat CV filename, file path, file type, upload date, or default-CV status as evidence of applicant qualifications.
- If CV content is unavailable, do not make claims about what is inside the CV.
- Use the applicant's profile, skills, experience, available CV content, opportunity requirements, and assessment answers as evidence.
- Compare the applicant against the actual opportunity requirements.
- Do not invent opportunity requirements.
- Assessment answers should be evaluated based on the question and the provided answer.
- Be fair and evidence-based.
- Overall score must be between 0 and 100.
- A high score means the applicant provides strong evidence of meeting the opportunity requirements.
- A low score means important requirements are missing, weakly supported, or contradicted by the available evidence.
- requirementMatch should be one of: HIGH, MEDIUM, LOW.
- strengths must contain evidence-based strengths only.
- gaps must contain evidence-based gaps only.
- Do not treat missing information as proof that the applicant lacks a skill.
- If information is unavailable, state that it is unavailable rather than inventing an answer.
- Return ONLY the requested JSON structure.

APPLICANT ID:
${input.applicantId}

APPLICATION ID:
${input.applicationId}

OPPORTUNITY ID:
${input.opportunityId}

====================
APPLICANT PROFILE
====================

Academic year:
${input.applicant.profile.academicYear}

University:
${input.applicant.profile.university}

Field of study:
${input.applicant.profile.fieldOfStudy}

Location:
${input.applicant.profile.location ?? 'Not provided'}

Career goals:
${input.applicant.profile.careerGoals ?? 'Not provided'}

Career goal tags:
${JSON.stringify(input.applicant.profile.careerGoalTags)}

Interests:
${JSON.stringify(input.applicant.profile.interests)}

====================
APPLICANT SKILLS
====================

${JSON.stringify(input.applicant.skills, null, 2)}

====================
APPLICANT EXPERIENCE
====================

${JSON.stringify(input.applicant.experiences, null, 2)}

====================
CV CONTENT
====================

${cvSection}

====================
OPPORTUNITY
====================

Title:
${input.opportunity.title}

Description:
${input.opportunity.description}

Opportunity type:
${input.opportunity.opportunityType}

Location:
${input.opportunity.location ?? 'Not provided'}

Remote:
${input.opportunity.isRemote}

Minimum academic year:
${input.opportunity.minimumAcademicYear ?? 'Not specified'}

Maximum academic year:
${input.opportunity.maximumAcademicYear ?? 'Not specified'}

Minimum GPA:
${input.opportunity.minimumGpa ?? 'Not specified'}

Eligible fields:
${JSON.stringify(input.opportunity.eligibleFields)}

Required skills:
${JSON.stringify(input.opportunity.requiredSkills, null, 2)}

====================
ASSESSMENT QUESTIONS
====================

${JSON.stringify(input.assessment.questions, null, 2)}

====================
APPLICANT ANSWERS
====================

${JSON.stringify(input.assessment.answers, null, 2)}

====================
OUTPUT
====================

Return JSON with exactly these fields:

{
  "applicantId": "...",
  "applicationId": "...",
  "opportunityId": "...",
  "overallScore": 0,
  "requirementMatch": "HIGH | MEDIUM | LOW",
  "skillAnalysis": {},
  "strengths": [],
  "gaps": [],
  "summary": "..."
}
`;
  }

  private validateResponse(
    result: ApplicantAnalysisOutput,
    input: ApplicantAnalysisInput,
  ): ApplicantAnalysisOutput {
    if (!result || typeof result !== 'object') {
      throw new InternalServerErrorException(
        'AI returned an invalid applicant analysis response.',
      );
    }

    if (result.applicantId !== input.applicantId) {
      throw new InternalServerErrorException(
        'AI returned an incorrect applicant ID.',
      );
    }

    if (result.applicationId !== input.applicationId) {
      throw new InternalServerErrorException(
        'AI returned an incorrect application ID.',
      );
    }

    if (result.opportunityId !== input.opportunityId) {
      throw new InternalServerErrorException(
        'AI returned an incorrect opportunity ID.',
      );
    }

    if (
      result.overallScore !== null &&
      (!Number.isInteger(result.overallScore) ||
        result.overallScore < 0 ||
        result.overallScore > 100)
    ) {
      throw new InternalServerErrorException(
        'AI returned an invalid applicant score.',
      );
    }

    if (
      result.requirementMatch !== null &&
      !['HIGH', 'MEDIUM', 'LOW'].includes(result.requirementMatch)
    ) {
      throw new InternalServerErrorException(
        'AI returned an invalid requirement match.',
      );
    }

    if (!Array.isArray(result.strengths)) {
      throw new InternalServerErrorException(
        'AI returned invalid applicant strengths.',
      );
    }

    if (!Array.isArray(result.gaps)) {
      throw new InternalServerErrorException(
        'AI returned invalid applicant gaps.',
      );
    }

    if (
      result.strengths.some(
        (item) => typeof item !== 'string' || item.trim().length === 0,
      )
    ) {
      throw new InternalServerErrorException(
        'AI returned invalid applicant strengths.',
      );
    }

    if (
      result.gaps.some(
        (item) => typeof item !== 'string' || item.trim().length === 0,
      )
    ) {
      throw new InternalServerErrorException(
        'AI returned invalid applicant gaps.',
      );
    }

    if (
      result.summary !== null &&
      typeof result.summary !== 'string'
    ) {
      throw new InternalServerErrorException(
        'AI returned an invalid applicant summary.',
      );
    }

    return {
      applicantId: input.applicantId,
      applicationId: input.applicationId,
      opportunityId: input.opportunityId,
      overallScore: result.overallScore,
      requirementMatch: result.requirementMatch,
      skillAnalysis: result.skillAnalysis,
      strengths: result.strengths.map((item) => item.trim()),
      gaps: result.gaps.map((item) => item.trim()),
      summary: result.summary?.trim() ?? null,
    };
  }
}