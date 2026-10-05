import { Test, TestingModule } from '@nestjs/testing';

import { RecommendationsService } from '@/recommendations/recommendations.service';
import { StudentProfileRepository } from '@/student-profile/student-profile.repository';

import { VoiceSearchCriteriaService } from './voice-search-criteria.service';
import { VoiceService } from './voice.service';

describe('VoiceService', () => {
  let service: VoiceService;

  const recommendationsService = {
    getRecommendations: jest.fn(),
  };

  const studentProfileRepository = {
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    studentProfileRepository.findByUserId.mockResolvedValue({
      id: 'profile-1',
      userId: 'student-user-id',
    });

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          VoiceService,
          {
            provide: RecommendationsService,
            useValue: recommendationsService,
          },
          {
            provide: StudentProfileRepository,
            useValue: studentProfileRepository,
          },
          VoiceSearchCriteriaService,
        ],
      }).compile();

    service = module.get<VoiceService>(VoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extract criteria and return a helpful message when no opportunities match', async () => {
    recommendationsService.getRecommendations.mockResolvedValue([]);

    const result = await service.searchByVoice(
      'student-user-id',
      {
        query:
          'Find me remote AI internships for third-year students',
      },
    );

    expect(
      recommendationsService.getRecommendations,
    ).toHaveBeenCalledWith(
      'student-user-id',
      {
        keyword: 'AI',
        type: 'INTERNSHIP',
        isRemote: true,
        minimumAcademicYear: 3,
        maximumAcademicYear: 3,
      },
    );

    expect(result).toEqual({
      results: [],
      message:
        'No matching opportunities were found. Try changing your search criteria.',
    });
  });

  it('should return matching opportunities with a success message', async () => {
    const recommendations = [
      {
        opportunity: {
          id: 'opportunity-1',
        },
        score: 0.85,
        matchedSkills: ['Python'],
        matchedInterests: ['AI'],
      },
    ];

    recommendationsService.getRecommendations.mockResolvedValue(
      recommendations,
    );

    const result = await service.searchByVoice(
      'student-user-id',
      {
        query: 'Find me remote AI internships',
      },
    );

    expect(result).toEqual({
      results: recommendations,
      message: 'Matching opportunities found.',
    });
  });

  it('should reject voice search when the student profile does not exist', async () => {
    studentProfileRepository.findByUserId.mockResolvedValue(null);

    await expect(
      service.searchByVoice('student-user-id', {
        query: 'Find me remote AI internships',
      }),
    ).rejects.toThrow(
      'Student profile not found. Please complete your profile before using voice search.',
    );

    expect(
      recommendationsService.getRecommendations,
    ).not.toHaveBeenCalled();
  });

  it('should reject an empty voice query', async () => {
    await expect(
      service.searchByVoice('student-user-id', {
        query: '   ',
      }),
    ).rejects.toThrow(
      'Voice search query cannot be empty.',
    );

    expect(
      recommendationsService.getRecommendations,
    ).not.toHaveBeenCalled();
  });

  it('should reject an unclear voice query', async () => {
    await expect(
      service.searchByVoice('student-user-id', {
        query: 'hello there',
      }),
    ).rejects.toThrow(
      'Unable to understand the search request.',
    );

    expect(
      recommendationsService.getRecommendations,
    ).not.toHaveBeenCalled();
  });

  it('should propagate an error when the recommendation service fails', async () => {
    recommendationsService.getRecommendations.mockRejectedValue(
      new Error('Search service failed'),
    );

    await expect(
      service.searchByVoice('student-user-id', {
        query: 'Find me remote Python internships',
      }),
    ).rejects.toThrow('Search service failed');
  });
});