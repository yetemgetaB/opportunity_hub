import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OpportunityType } from '@prisma/client';

export class SearchOpportunityDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUUID()
  skills?: string;

  @IsOptional()
  @IsEnum(OpportunityType)
  type?: OpportunityType;
}