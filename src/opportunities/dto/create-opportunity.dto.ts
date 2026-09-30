import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { OpportunityType } from '@prisma/client';
import { OpportunitySkillDto } from './opportunity-skill.dto';

export class CreateOpportunityDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsEnum(OpportunityType)
  opportunityType: OpportunityType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpportunitySkillDto)
  skills?: OpportunitySkillDto[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minimumAcademicYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maximumAcademicYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumGpa?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eligibleFields?: string[];

  @IsOptional()
  @IsString()
  compensation?: string;

  @IsOptional()
  @IsUrl()
  applicationUrl?: string;
}