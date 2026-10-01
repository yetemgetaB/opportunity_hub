import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { SkillRequirementLevel } from '@prisma/client';

export class OpportunitySkillDto {
  @IsUUID()
  @IsNotEmpty()
  skillId: string;

  @IsOptional()
  @IsEnum(SkillRequirementLevel)
  requirementLevel?: SkillRequirementLevel;
}