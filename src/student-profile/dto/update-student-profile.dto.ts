import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateStudentProfileDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  academicYear?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  university?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  fieldOfStudy?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  careerGoals?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  careerGoalTags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsBoolean()
  isDiscoverable?: boolean;
}