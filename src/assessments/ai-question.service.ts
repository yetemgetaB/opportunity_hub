import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

export interface AssessmentRequirements {
  title: string;
  description: string;
  requiredSkills: string[];
  location?: string | null;
  eligibleFields: string[];
  minimumAcademicYear?: number | null;
  maximumAcademicYear?: number | null;
  minimumGpa?: number | null;
  opportunityType?: string | null;
}

export interface GeneratedAssessmentQuestion {
  question: string;
  type: 'technical' | 'behavioral' | 'experience' | 'general';
}

export interface GeneratedAssessmentQuestions {
  questions: GeneratedAssessmentQuestion[];
}

@Injectable()
export class AIQuestionService {
  private ai: GoogleGenAI | null = null;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ai.apiKey');

    this.model =
      this.configService.get<string>('ai.model') ||
      'gemini-3.8-flash';

    if (apiKey) {
      this.ai = new GoogleGenAI({
        apiKey,
      });
    }
  }

  private getClient(): GoogleGenAI {
    if (this.ai) {
      return this.ai;
    }

    const apiKey = this.configService.get<string>('ai.apiKey');
    if (!apiKey) {
      throw new InternalServerErrorException('AI_API_KEY is not configured.');
    }

    this.ai = new GoogleGenAI({
      apiKey,
    });
    return this.ai;
  }

  async generateQuestions(
    requirements: AssessmentRequirements,
  ): Promise<GeneratedAssessmentQuestions> {
    const prompt = this.buildPrompt(requirements);

    try {
      const response = await this.getClient().models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    question: {
                      type: 'string',
                    },
                    type: {
                      type: 'string',
                      enum: [
                        'technical',
                        'behavioral',
                        'experience',
                        'general',
                      ],
                    },
                  },
                  required: ['question', 'type'],
                },
              },
            },
            required: ['questions'],
          },
        },
      });

      const text = response.text;

      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      const result = JSON.parse(text) as GeneratedAssessmentQuestions;

      return this.validateResponse(result);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        throw new InternalServerErrorException(
          'AI returned an invalid assessment question response.',
        );
      }

      throw new InternalServerErrorException(
        'Failed to generate assessment questions.',
      );
    }
  }

  private buildPrompt(
    requirements: AssessmentRequirements,
  ): string {
    return `
Generate assessment questions for the following opportunity.

OPPORTUNITY TITLE:
${requirements.title}

OPPORTUNITY DESCRIPTION:
${requirements.description || 'None specified'}

REQUIRED SKILLS:
${requirements.requiredSkills.join(', ') || 'None specified'}

LOCATION:
${requirements.location || 'None specified'}

ELIGIBLE FIELDS:
${requirements.eligibleFields.join(', ') || 'None specified'}

MINIMUM ACADEMIC YEAR:
${requirements.minimumAcademicYear ?? 'None specified'}

MAXIMUM ACADEMIC YEAR:
${requirements.maximumAcademicYear ?? 'None specified'}

MINIMUM GPA:
${requirements.minimumGpa ?? 'None specified'}

OPPORTUNITY TYPE:
${requirements.opportunityType || 'None specified'}

IMPORTANT INSTRUCTIONS:
- Generate exactly 5 assessment questions.
- Questions must be directly relevant to the opportunity.
- Test the required skills and knowledge described in the opportunity.
- Include behavioral or experience questions only when they are relevant to the provided information.
- Do not invent skills, responsibilities, experience requirements, or other requirements that are not present in the provided information.
- Do not ask questions unrelated to the opportunity.
- Avoid duplicate questions.
- Keep questions clear and suitable for an applicant assessment.
- Return only the requested JSON structure.
`;
  }

  private validateResponse(
    result: GeneratedAssessmentQuestions,
  ): GeneratedAssessmentQuestions {
    if (!result || !Array.isArray(result.questions)) {
      throw new InternalServerErrorException(
        'AI returned an invalid assessment question response.',
      );
    }

    const validQuestions = result.questions.filter(
      (item) =>
        item &&
        typeof item.question === 'string' &&
        item.question.trim().length > 0 &&
        [
          'technical',
          'behavioral',
          'experience',
          'general',
        ].includes(item.type),
    );

    if (validQuestions.length < 5) {
      throw new InternalServerErrorException(
        'AI did not generate enough valid assessment questions.',
      );
    }

    const uniqueQuestions = Array.from(
      new Map(
        validQuestions.map((item) => [
          item.question.trim().toLowerCase(),
          {
            question: item.question.trim(),
            type: item.type,
          },
        ]),
      ).values(),
    );

    if (uniqueQuestions.length < 5) {
      throw new InternalServerErrorException(
        'AI generated duplicate assessment questions.',
      );
    }

    return {
      questions: uniqueQuestions.slice(0, 5),
    };
  }
}