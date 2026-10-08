import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateAdminProfileDto {
  @ValidateIf((_, value) => value !== undefined)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: 'First name cannot be empty.' })
  @Matches(/\S/, { message: 'First name cannot be whitespace only.' })
  firstName?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? (value.trim() === '' ? null : value.trim()) : value,
  )
  @IsString()
  middleName?: string | null;

  @ValidateIf((_, value) => value !== undefined)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: 'Last name cannot be empty.' })
  @Matches(/\S/, { message: 'Last name cannot be whitespace only.' })
  lastName?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? (value.trim() === '' ? null : value.trim()) : value,
  )
  @IsUrl()
  avatarUrl?: string | null;
}
