import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  IsUrl,
  Min,
  Max,
  MinLength,
} from 'class-validator';

import { OpportunityType } from '@prisma/client';

export class UpdateOpportunityDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsEnum(OpportunityType)
  opportunityType?: OpportunityType;

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
  @IsInt()
  @Min(1)
  minimumAcademicYear?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
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
  compensation?: string;

  @IsOptional()
  @IsUrl()
  applicationUrl?: string;
}