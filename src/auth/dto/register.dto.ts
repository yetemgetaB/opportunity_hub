import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export enum PublicRegisterRole {
  STUDENT = 'STUDENT',
  ORGANIZATION = 'ORGANIZATION',
}

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long.',
  })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter.',
  })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter.',
  })
  @Matches(/[0-9]/, {
    message: 'Password must contain at least one number.',
  })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'Password must contain at least one special character.',
  })
  password: string;

  @IsString()
  @MinLength(1, { message: 'First name is required.' })
  firstName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  @MinLength(1, { message: 'Last name is required.' })
  lastName: string;

  @IsEnum(PublicRegisterRole, {
    message: 'Role must be either STUDENT or ORGANIZATION.',
  })
  role: PublicRegisterRole;
}

