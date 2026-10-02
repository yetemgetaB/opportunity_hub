import { validate } from 'class-validator';

import {
  RegisterDto,
  PublicRegisterRole,
} from '../../src/auth/dto/register.dto';

describe('RegisterDto Validation', () => {
  it('should accept STUDENT role', async () => {
    const dto = Object.assign(new RegisterDto(), {
      email: 'student@example.com',
      password: 'Student123!',
      firstName: 'John',
      middleName: 'Middle',
      lastName: 'Doe',
      role: PublicRegisterRole.STUDENT,
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should accept ORGANIZATION role with organization name', async () => {
    const dto = Object.assign(new RegisterDto(), {
      email: 'organization@example.com',
      password: 'Organization123!',
      firstName: 'Jane',
      middleName: 'Middle',
      lastName: 'Doe',
      role: PublicRegisterRole.ORGANIZATION,
      organizationName: 'Example Organization',
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should reject ORGANIZATION role without organization name', async () => {
    const dto = Object.assign(new RegisterDto(), {
      email: 'organization@example.com',
      password: 'Organization123!',
      firstName: 'Jane',
      lastName: 'Doe',
      role: PublicRegisterRole.ORGANIZATION,
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject ADMIN role during public registration', async () => {
    const dto = Object.assign(new RegisterDto(), {
      email: 'admin@example.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});