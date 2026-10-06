import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class AssessmentResultFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxScore?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isFinalApproved?: boolean;

  @IsOptional()
  @IsIn([
    'finalScore_desc',
    'finalScore_asc',
    'aiScore_desc',
    'aiScore_asc',
    'createdAt_desc',
    'createdAt_asc',
  ])
  orderBy?:
    | 'finalScore_desc'
    | 'finalScore_asc'
    | 'aiScore_desc'
    | 'aiScore_asc'
    | 'createdAt_desc'
    | 'createdAt_asc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;
}

