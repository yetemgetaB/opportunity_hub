import { IsNotEmpty, IsUUID } from 'class-validator';

export class StartAssessmentAttemptDto {
  @IsNotEmpty({ message: 'applicationId is required.' })
  @IsUUID('4', { message: 'applicationId must be a valid UUID.' })
  applicationId: string;
}
