import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SaveAssessmentAnswerDto {
  @IsNotEmpty({ message: 'assessmentQuestionId is required.' })
  @IsUUID('4', { message: 'assessmentQuestionId must be a valid UUID.' })
  assessmentQuestionId: string;

  @IsNotEmpty({ message: 'answerText is required.' })
  @IsString({ message: 'answerText must be a string.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MinLength(1, { message: 'answerText cannot be empty.' })
  @MaxLength(10000, {
    message: 'answerText exceeds maximum allowed length of 10000 characters.',
  })
  answerText: string;
}
