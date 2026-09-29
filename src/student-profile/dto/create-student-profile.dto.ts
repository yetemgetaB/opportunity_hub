import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateStudentProfileDto {
  @IsInt()
  @Min(1)
  academicYear: number;

  @IsString()
  @MinLength(1)
  university: string;

  @IsString()
  @MinLength(1)
  fieldOfStudy: string;

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