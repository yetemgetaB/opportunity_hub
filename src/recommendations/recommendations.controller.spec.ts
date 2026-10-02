import { Test, TestingModule } from '@nestjs/testing';

import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

describe('RecommendationsController', () => {
  let controller: RecommendationsController;

  const recommendationsService = {
    getRecommendations: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationsController],
      providers: [
        {
          provide: RecommendationsService,
          useValue: recommendationsService,
        },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<RecommendationsController>(
      RecommendationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return recommendations for the current student', async () => {
    const recommendations = [
      {
        opportunity: {
          id: 'opportunity-1',
          title: 'Python Internship',
        },
        score: 90,
        matchedSkills: ['Python'],
      },
    ];

    recommendationsService.getRecommendations.mockResolvedValue(
      recommendations,
    );

    const result = await controller.getRecommendations('student-1');

    expect(
      recommendationsService.getRecommendations,
    ).toHaveBeenCalledWith('student-1');

    expect(result).toEqual(recommendations);
  });
});

