import { IsNotEmpty, IsString } from 'class-validator';

export class VoiceSearchDto {
  @IsString()
  @IsNotEmpty()
  query!: string;
}