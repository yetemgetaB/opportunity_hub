import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

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
  @MinLength(1)
  firstName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsEnum(UserRole, {
    message: 'Role must be STUDENT, ORGANIZATION, or ADMIN.',
  })
  role: UserRole;
}