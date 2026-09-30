import {
  IsEnum,
  IsUUID,
} from 'class-validator';

import { SkillRequirementLevel } from '@prisma/client';

export class OpportunitySkillDto {
  @IsUUID()
  skillId: string;

  @IsEnum(SkillRequirementLevel)
  requirementLevel: SkillRequirementLevel;
}