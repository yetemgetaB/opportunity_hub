import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

import {
  AIQuestionService,
  AssessmentRequirements,
} from '../../src/assessments/ai-question.service';

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(),
}));

describe('AIQuestionService', () => {
  let service: AIQuestionService;

  const generateContent = jest.fn();

  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'ai.apiKey') {
        return 'test-api-key';
      }

      if (key === 'ai.model') {
        return 'gemini-3.8-flash';
      }

      return undefined;
    }),
  } as unknown as ConfigService;

  const requirements: AssessmentRequirements = {
    title: 'Backend Developer',
    description:
      'Build backend APIs and work with the backend engineering team.',
    requiredSkills: [
      'TypeScript',
      'NestJS',
      'PostgreSQL',
    ],
    location: 'Addis Ababa',
    eligibleFields: ['Computer Science'],
    minimumAcademicYear: 3,
    maximumAcademicYear: 5,
    minimumGpa: 2.5,
    opportunityType: 'INTERNSHIP',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (GoogleGenAI as jest.Mock).mockImplementation(() => ({
      models: {
        generateContent,
      },
    }));

    service = new AIQuestionService(configService);
  });

  it('should generate and return assessment questions', async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        questions: [
          {
            question:
              'What is dependency injection in NestJS?',
            type: 'technical',
          },
          {
            question:
              'How would you design a REST API for an internship platform?',
            type: 'technical',
          },
          {
            question:
              'Describe a challenging backend project you have worked on.',
            type: 'experience',
          },
          {
            question:
              'How would you handle a disagreement with a backend team member?',
            type: 'behavioral',
          },
          {
            question:
              'Why are you interested in this backend development opportunity?',
            type: 'general',
          },
        ],
      }),
    });

    const result =
      await service.generateQuestions(requirements);

    expect(result.questions).toHaveLength(5);

    expect(result.questions[0]).toEqual({
      question:
        'What is dependency injection in NestJS?',
      type: 'technical',
    });

    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it('should filter invalid generated questions', async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        questions: [
          {
            question: 'What is NestJS?',
            type: 'technical',
          },
          {
            question:
              'Explain how you would structure a NestJS application.',
            type: 'technical',
          },
          {
            question:
              'Describe your experience building backend APIs.',
            type: 'experience',
          },
          {
            question:
              'How do you handle teamwork challenges?',
            type: 'behavioral',
          },
          {
            question:
              'Why do you want this internship?',
            type: 'general',
          },
          {
            question: '',
            type: 'technical',
          },
        ],
      }),
    });

    const result =
      await service.generateQuestions(requirements);

    expect(result.questions).toHaveLength(5);

    expect(
      result.questions.every(
        (item) =>
          typeof item.question === 'string' &&
          item.question.trim().length > 0,
      ),
    ).toBe(true);
  });

  it('should throw an error when fewer than five valid questions are returned', async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        questions: [
          {
            question: 'What is NestJS?',
            type: 'technical',
          },
          {
            question:
              'Describe your backend development experience.',
            type: 'experience',
          },
        ],
      }),
    });

    await expect(
      service.generateQuestions(requirements),
    ).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('should throw an error when Gemini returns invalid JSON', async () => {
    generateContent.mockResolvedValue({
      text: 'invalid json',
    });

    await expect(
      service.generateQuestions(requirements),
    ).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('should throw an error when Gemini returns an empty response', async () => {
    generateContent.mockResolvedValue({
      text: '',
    });

    await expect(
      service.generateQuestions(requirements),
    ).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});

