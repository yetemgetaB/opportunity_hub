import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class AddStudentSkillDto {
  @IsUUID()
  @IsNotEmpty()
  skillId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  proficiency?: number;

  @IsNumber()
  @Min(0)
  @Max(50)
  @IsOptional()
  yearsOfExperience?: number;
}

export class BulkSetStudentSkillsDto {
  @IsArray()
  @IsUUID('all', { each: true })
  skillIds: string[];
}
