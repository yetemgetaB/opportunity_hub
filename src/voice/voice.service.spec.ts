import { Test, TestingModule } from '@nestjs/testing';
import { OpportunityType } from '@prisma/client';
import { VoiceService } from './voice.service';
import { OpportunitiesService } from '@/opportunities/opportunities.service';

describe('VoiceService', () => {
  let service: VoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoiceService],
    }).compile();

    service = module.get<VoiceService>(VoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty array if OpportunitiesService is not available', async () => {
    const result = await service.search({ keyword: 'AI' });
    expect(result).toEqual([]);
  });

  it('should delegate search to OpportunitiesService with structured parameters', async () => {
    const mockOpportunitiesService = {
      searchOpportunities: jest.fn().mockResolvedValue([{ id: 'opp-1', title: 'AI Intern' }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoiceService,
        {
          provide: OpportunitiesService,
          useValue: mockOpportunitiesService,
        },
      ],
    }).compile();

    const voiceServiceWithOpp = module.get<VoiceService>(VoiceService);

    const query = {
      keyword: 'AI',
      type: OpportunityType.INTERNSHIP,
      isRemote: true,
      field: 'Computer Science',
      academicYear: 3,
      skills: ['Python'],
    };

    const result = await voiceServiceWithOpp.search(query, 'student-user-123');

    expect(mockOpportunitiesService.searchOpportunities).toHaveBeenCalledWith(
      {
        keyword: 'AI',
        type: OpportunityType.INTERNSHIP,
        isRemote: true,
        location: undefined,
        field: 'Computer Science',
        fields: undefined,
        academicYear: 3,
        skillIds: undefined,
        skillNames: ['Python'],
      },
      'student-user-123',
    );
    expect(result).toEqual([{ id: 'opp-1', title: 'AI Intern' }]);
  });
});
