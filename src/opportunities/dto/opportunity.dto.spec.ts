import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { OpportunityType, SkillRequirementLevel } from '@prisma/client';
import { CreateOpportunityDto } from './create-opportunity.dto';
import { UpdateOpportunityDto } from './update-opportunity.dto';
import { OpportunitySkillDto } from './opportunity-skill.dto';

describe('Opportunity DTO Validation', () => {
  const validUuid = '123e4567-e89b-42d3-a456-426614174000';

  describe('CreateOpportunityDto', () => {
    it('should validate valid CreateOpportunityDto', async () => {
      const dto = plainToInstance(CreateOpportunityDto, {
        title: 'Backend Engineer Intern',
        description: 'Design and implement REST APIs',
        opportunityType: OpportunityType.INTERNSHIP,
        minimumAcademicYear: 2,
        maximumAcademicYear: 5,
        minimumGpa: 3.5,
        skills: [
          {
            skillId: validUuid,
            requirementLevel: SkillRequirementLevel.REQUIRED,
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if title is missing or empty', async () => {
      const dto = plainToInstance(CreateOpportunityDto, {
        description: 'Valid description',
        opportunityType: OpportunityType.INTERNSHIP,
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'title')).toBe(true);
    });

    it('should fail if title exceeds 200 characters', async () => {
      const dto = plainToInstance(CreateOpportunityDto, {
        title: 'A'.repeat(201),
        description: 'Valid description',
        opportunityType: OpportunityType.INTERNSHIP,
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'title')).toBe(true);
    });

    it('should fail if description exceeds 10,000 characters', async () => {
      const dto = plainToInstance(CreateOpportunityDto, {
        title: 'Valid title',
        description: 'A'.repeat(10001),
        opportunityType: OpportunityType.INTERNSHIP,
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'description')).toBe(true);
    });

    it('should fail if academic year is out of 1-6 range', async () => {
      const dto = plainToInstance(CreateOpportunityDto, {
        title: 'Valid title',
        description: 'Valid description',
        opportunityType: OpportunityType.INTERNSHIP,
        minimumAcademicYear: 0,
        maximumAcademicYear: 7,
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'minimumAcademicYear')).toBe(true);
      expect(errors.some((e) => e.property === 'maximumAcademicYear')).toBe(true);
    });

    it('should fail if GPA is out of 0-4 range', async () => {
      const dto = plainToInstance(CreateOpportunityDto, {
        title: 'Valid title',
        description: 'Valid description',
        opportunityType: OpportunityType.INTERNSHIP,
        minimumGpa: 4.5,
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'minimumGpa')).toBe(true);
    });

    it('should fail if opportunityType is invalid enum', async () => {
      const dto = plainToInstance(CreateOpportunityDto, {
        title: 'Valid title',
        description: 'Valid description',
        opportunityType: 'INVALID_TYPE' as any,
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'opportunityType')).toBe(true);
    });
  });

  describe('UpdateOpportunityDto', () => {
    it('should validate empty or partial UpdateOpportunityDto', async () => {
      const dto = plainToInstance(UpdateOpportunityDto, {
        title: 'Updated title',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if updated title exceeds 200 characters', async () => {
      const dto = plainToInstance(UpdateOpportunityDto, {
        title: 'A'.repeat(201),
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'title')).toBe(true);
    });
  });

  describe('OpportunitySkillDto', () => {
    it('should validate valid skillId UUID', async () => {
      const dto = plainToInstance(OpportunitySkillDto, {
        skillId: validUuid,
        requirementLevel: SkillRequirementLevel.REQUIRED,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if skillId is not a valid UUID', async () => {
      const dto = plainToInstance(OpportunitySkillDto, {
        skillId: 'invalid-uuid-format',
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'skillId')).toBe(true);
    });
  });
});
