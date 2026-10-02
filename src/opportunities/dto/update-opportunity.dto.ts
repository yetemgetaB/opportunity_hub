import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OpportunityStatus, OpportunityType } from '@prisma/client';
import { OpportunitySkillDto } from './opportunity-skill.dto';

export class UpdateOpportunityDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsEnum(OpportunityType)
  opportunityType?: OpportunityType;

  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpportunitySkillDto)
  skills?: OpportunitySkillDto[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  minimumAcademicYear?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  maximumAcademicYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  minimumGpa?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eligibleFields?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  compensation?: string;

  @IsOptional()
  @IsUrl()
  applicationUrl?: string;
}