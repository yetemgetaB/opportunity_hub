import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { StartAssessmentAttemptDto } from './start-assessment-attempt.dto';
import { SaveAssessmentAnswerDto } from './save-assessment-answer.dto';

describe('Assessment DTO Validation', () => {
  const validUuid = '123e4567-e89b-42d3-a456-426614174000';

  describe('StartAssessmentAttemptDto', () => {
    it('should validate a valid StartAssessmentAttemptDto', async () => {
      const dto = plainToInstance(StartAssessmentAttemptDto, {
        applicationId: validUuid,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if applicationId is missing', async () => {
      const dto = plainToInstance(StartAssessmentAttemptDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'applicationId')).toBe(true);
    });

    it('should fail if applicationId is not a valid UUID', async () => {
      const dto = plainToInstance(StartAssessmentAttemptDto, {
        applicationId: 'not-a-valid-uuid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'applicationId')).toBe(true);
    });
  });

  describe('SaveAssessmentAnswerDto', () => {
    it('should validate a valid SaveAssessmentAnswerDto', async () => {
      const dto = plainToInstance(SaveAssessmentAnswerDto, {
        assessmentQuestionId: validUuid,
        answerText: 'This is my valid assessment answer.',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.answerText).toBe('This is my valid assessment answer.');
    });

    it('should trim surrounding whitespace from answerText', async () => {
      const dto = plainToInstance(SaveAssessmentAnswerDto, {
        assessmentQuestionId: validUuid,
        answerText: '   Trimmed answer text   ',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.answerText).toBe('Trimmed answer text');
    });

    it('should fail if answerText contains only whitespace', async () => {
      const dto = plainToInstance(SaveAssessmentAnswerDto, {
        assessmentQuestionId: validUuid,
        answerText: '     ',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'answerText')).toBe(true);
    });

    it('should fail if answerText is empty', async () => {
      const dto = plainToInstance(SaveAssessmentAnswerDto, {
        assessmentQuestionId: validUuid,
        answerText: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'answerText')).toBe(true);
    });

    it('should fail if answerText is missing', async () => {
      const dto = plainToInstance(SaveAssessmentAnswerDto, {
        assessmentQuestionId: validUuid,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'answerText')).toBe(true);
    });

    it('should fail if assessmentQuestionId is missing', async () => {
      const dto = plainToInstance(SaveAssessmentAnswerDto, {
        answerText: 'Some answer text',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'assessmentQuestionId')).toBe(true);
    });

    it('should fail if assessmentQuestionId is not a valid UUID', async () => {
      const dto = plainToInstance(SaveAssessmentAnswerDto, {
        assessmentQuestionId: 'invalid-id',
        answerText: 'Some answer text',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'assessmentQuestionId')).toBe(true);
    });

    it('should fail if answerText exceeds 10,000 characters', async () => {
      const dto = plainToInstance(SaveAssessmentAnswerDto, {
        assessmentQuestionId: validUuid,
        answerText: 'a'.repeat(10001),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'answerText')).toBe(true);
    });
  });
});
