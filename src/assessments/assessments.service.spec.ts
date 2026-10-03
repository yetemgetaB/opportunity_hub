import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentsService } from './assessments.service';

import { AssessmentsRepository } from './assessments.repository';
import { OrganizationProfileRepository } from '@/organization-profile/organization-profile.repository';
import { OpportunitiesRepository } from '@/opportunities/opportunities.repository';

describe('AssessmentsService', () => {
  let service: AssessmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
  AssessmentsService,
  {
    provide: AssessmentsRepository,
    useValue: {},
  },
  {
    provide: OrganizationProfileRepository,
    useValue: {},
  },
  {
    provide: OpportunitiesRepository,
    useValue: {},
  },
],
    }).compile();

    service = module.get<AssessmentsService>(AssessmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
