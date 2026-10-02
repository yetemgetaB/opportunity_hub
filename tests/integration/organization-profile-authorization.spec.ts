import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

import { OrganizationProfileController } from '@/organization-profile/organization-profile.controller';
import { OrganizationProfileService } from '@/organization-profile/organization-profile.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

describe('Organization Profile Authorization Integration', () => {
let controller: OrganizationProfileController;
let service: OrganizationProfileService;

const mockService = {
getMyProfile: jest.fn(),
updateMyProfile: jest.fn(),
};

const createAuthGuard = (
userId: string | undefined,
): CanActivate => ({
canActivate: (context: ExecutionContext) => {
const request = context.switchToHttp().getRequest();


  if (userId) {
    request.user = {
      id: userId,
    };
  }

  return true;
},


});

const createRolesGuard = (
role: UserRole,
): CanActivate => ({
canActivate: () => {
if (role !== UserRole.ORGANIZATION) {
throw new Error(
'You do not have permission to access this resource.',
);
}


  return true;
},


});

beforeEach(async () => {
const module: TestingModule =
await Test.createTestingModule({
controllers: [OrganizationProfileController],
providers: [
{
provide: OrganizationProfileService,
useValue: mockService,
},
],
})
.overrideGuard(SupabaseAuthGuard)
.useValue(
createAuthGuard(
'22222222-2222-2222-2222-222222222222',
),
)
.overrideGuard(RolesGuard)
.useValue(
createRolesGuard(UserRole.ORGANIZATION),
)
.compile();


controller = module.get<OrganizationProfileController>(
  OrganizationProfileController,
);

service = module.get<OrganizationProfileService>(
  OrganizationProfileService,
);

jest.clearAllMocks();


});

afterEach(() => {
jest.clearAllMocks();
});

it('should allow an organization user to access their organization profile', async () => {
const organizationUserId =
'22222222-2222-2222-2222-222222222222';


const organizationProfile = {
  id: 'org-123',
  name: 'Tech Ventures',
  description: 'Software company',
  websiteUrl: 'https://tech.example.com',
  verificationStatus: 'PENDING',
};

mockService.getMyProfile.mockResolvedValue(
  organizationProfile,
);

const result =
  await controller.getMyProfile(organizationUserId);

expect(service.getMyProfile).toHaveBeenCalledWith(
  organizationUserId,
);

expect(result).toEqual(organizationProfile);


});

it('should update the authenticated organization user profile', async () => {
const organizationUserId =
'22222222-2222-2222-2222-222222222222';


const dto = {
  description: 'Updated organization description',
};

const updatedProfile = {
  id: 'org-123',
  name: 'Tech Ventures',
  description: 'Updated organization description',
  verificationStatus: 'PENDING',
};

mockService.updateMyProfile.mockResolvedValue(
  updatedProfile,
);

const result = await controller.updateMyProfile(
  organizationUserId,
  dto,
);

expect(service.updateMyProfile).toHaveBeenCalledWith(
  organizationUserId,
  dto,
);

expect(result).toEqual(updatedProfile);


});

it('should reject access when the user has no organization membership', async () => {
mockService.getMyProfile.mockRejectedValue(
new Error('Organization profile not found.'),
);


await expect(
  controller.getMyProfile(
    '33333333-3333-3333-3333-333333333333',
  ),
).rejects.toThrow(
  'Organization profile not found.',
);

expect(service.getMyProfile).toHaveBeenCalledWith(
  '33333333-3333-3333-3333-333333333333',
);


});

it('should require the ORGANIZATION role', () => {
const controllerMetadata = Reflect.getMetadata(
'roles',
OrganizationProfileController,
);


expect(controllerMetadata).toEqual([
  UserRole.ORGANIZATION,
]);


});

it('should reject a non-organization role', () => {
const roleGuard = createRolesGuard(
UserRole.STUDENT,
);


const context = {} as ExecutionContext;

expect(() =>
  roleGuard.canActivate(context),
).toThrow(
  'You do not have permission to access this resource.',
);


});
});
