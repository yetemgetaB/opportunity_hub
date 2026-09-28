import { validate } from 'class-validator';
import { RegisterDto, PublicRegisterRole } from '../../src/auth/dto/register.dto';

describe('RegisterDto Validation', () => {
  it('should accept STUDENT role', async () => {
    const dto = new RegisterDto();
    dto.email = 'student@example.com';
    dto.password = 'StrongPass1!';
    dto.firstName = 'Abebe';
    dto.lastName = 'Kebede';
    dto.role = PublicRegisterRole.STUDENT;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept ORGANIZATION role', async () => {
    const dto = new RegisterDto();
    dto.email = 'org@example.com';
    dto.password = 'StrongPass1!';
    dto.firstName = 'Acme';
    dto.lastName = 'Corp';
    dto.role = PublicRegisterRole.ORGANIZATION;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject ADMIN role during public registration', async () => {
    const dto = new RegisterDto();
    dto.email = 'admin@example.com';
    dto.password = 'StrongPass1!';
    dto.firstName = 'Admin';
    dto.lastName = 'User';
    dto.role = 'ADMIN' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const roleError = errors.find((e) => e.property === 'role');
    expect(roleError).toBeDefined();
    expect(roleError?.constraints?.isEnum).toContain(
      'Role must be either STUDENT or ORGANIZATION.',
    );
  });

  it('should reject arbitrary or missing roles', async () => {
    const dto = new RegisterDto();
    dto.email = 'hacker@example.com';
    dto.password = 'StrongPass1!';
    dto.firstName = 'Hacker';
    dto.lastName = 'User';
    dto.role = 'SUPERUSER' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const roleError = errors.find((e) => e.property === 'role');
    expect(roleError).toBeDefined();
  });
});
