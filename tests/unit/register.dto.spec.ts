import { validate } from 'class-validator';
import { UserRole } from '@prisma/client';
import { RegisterDto, PublicRegisterRole } from '../../src/auth/dto/register.dto';

describe('RegisterDto Validation', () => {
  it('should pass validation for STUDENT role', async () => {
    const dto = new RegisterDto();
    dto.email = 'student@test.com';
    dto.password = 'Password123!';
    dto.firstName = 'Abebe';
    dto.lastName = 'Kebede';
    dto.role = PublicRegisterRole.STUDENT;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation for ORGANIZATION role', async () => {
    const dto = new RegisterDto();
    dto.email = 'org@test.com';
    dto.password = 'Password123!';
    dto.firstName = 'Almaz';
    dto.lastName = 'Tesfaye';
    dto.role = PublicRegisterRole.ORGANIZATION;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject validation for ADMIN role', async () => {
    const dto = new RegisterDto();
    dto.email = 'admin@test.com';
    dto.password = 'Password123!';
    dto.firstName = 'Admin';
    dto.lastName = 'User';
    (dto as any).role = 'ADMIN';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const roleError = errors.find((e) => e.property === 'role');
    expect(roleError).toBeDefined();
    expect(roleError?.constraints?.isEnum).toContain(
      'Role must be either STUDENT or ORGANIZATION.',
    );
  });

  it('should reject invalid email or weak password', async () => {
    const dto = new RegisterDto();
    dto.email = 'invalid-email';
    dto.password = 'simple';
    dto.firstName = 'Abebe';
    dto.lastName = 'Kebede';
    dto.role = PublicRegisterRole.STUDENT;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should verify public registration role contract maps correctly and excludes ADMIN', () => {
    // Verify enum contract does not include ADMIN
    expect((PublicRegisterRole as any).ADMIN).toBeUndefined();
    expect(Object.values(PublicRegisterRole)).toEqual(['STUDENT', 'ORGANIZATION']);

    // Verify role mapping to Prisma UserRole
    const mapToUserRole = (role: PublicRegisterRole): UserRole => {
      return role === PublicRegisterRole.STUDENT
        ? UserRole.STUDENT
        : UserRole.ORGANIZATION;
    };

    expect(mapToUserRole(PublicRegisterRole.STUDENT)).toBe(UserRole.STUDENT);
    expect(mapToUserRole(PublicRegisterRole.ORGANIZATION)).toBe(UserRole.ORGANIZATION);
  });
});
