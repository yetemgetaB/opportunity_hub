import { Injectable } from '@nestjs/common';

export interface AssessmentRequirements {
  title: string;
  requiredSkills: string[];
  responsibilities: string[];
  experience: string[];
  otherRequirements: string[];
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
  async generateQuestions(
    requirements: AssessmentRequirements,
  ): Promise<GeneratedAssessmentQuestions> {
    // Day 11:
    // This service defines the AI question-generation contract.
    //
    // The actual AI provider integration will be implemented on Day 12.
    // No external AI API is called from this service yet.

    void requirements;

    return {
      questions: [],
    };
  }
}