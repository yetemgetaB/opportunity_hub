import { Test, TestingModule } from '@nestjs/testing';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesRepository } from './opportunities.repository';

describe('OpportunitiesService', () => {
  let service: OpportunitiesService;
  let repository: OpportunitiesRepository;

  const mockOpportunitiesRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByOrganizationId: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    addSkill: jest.fn(),
    removeSkill: jest.fn(),
    replaceSkills: jest.fn(),
    findSkillsByOpportunityId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunitiesService,
        {
          provide: OpportunitiesRepository,
          useValue: mockOpportunitiesRepository,
        },
      ],
    }).compile();

    service = module.get<OpportunitiesService>(OpportunitiesService);
    repository = module.get<OpportunitiesRepository>(OpportunitiesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined with injected repository', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });
});
