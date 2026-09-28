import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from '../../src/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../src/auth/auth.interface';
import { UserRole } from '@prisma/client';

function getParamDecoratorFactory() {
  class TestClass {
    public testMethod(@CurrentUser() user: AuthenticatedUser) {
      return user;
    }
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestClass, 'testMethod');
  return args[Object.keys(args)[0]].factory;
}

describe('CurrentUser Decorator', () => {
  const mockUser: AuthenticatedUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: UserRole.STUDENT,
    isActive: true,
  };

  const createMockContext = (userPayload: unknown): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: userPayload,
        }),
      }),
    } as ExecutionContext;
  };

  it('should extract the complete user object from request', () => {
    const factory = getParamDecoratorFactory();
    const context = createMockContext(mockUser);
    const result = factory(undefined, context);
    expect(result).toEqual(mockUser);
  });

  it('should extract a specific field when field name is provided', () => {
    const factory = getParamDecoratorFactory();
    const context = createMockContext(mockUser);
    const result = factory('id', context);
    expect(result).toBe(mockUser.id);
  });
});
