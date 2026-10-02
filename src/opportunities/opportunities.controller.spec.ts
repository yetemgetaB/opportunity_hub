import { Test, TestingModule } from '@nestjs/testing';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

describe('OpportunitiesController', () => {
  let controller: OpportunitiesController;

  const opportunitiesService = {
    createOpportunity: jest.fn(),
    getMyOpportunities: jest.fn(),
    getMyOpportunity: jest.fn(),
    updateOpportunity: jest.fn(),
    deleteOpportunity: jest.fn(),
    publishOpportunity: jest.fn(),
    searchOpportunities: jest.fn(),
    getPublishedOpportunity: jest.fn(),

    // Application-related controller methods
    applyToOpportunity: jest.fn(),
    getMyApplications: jest.fn(),
    updateApplicationStatus: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpportunitiesController],
      providers: [
        {
          provide: OpportunitiesService,
          useValue: opportunitiesService,
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

    controller = module.get<OpportunitiesController>(
      OpportunitiesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('placeholders and public routes', () => {
    it('applyToOpportunity returns student protected message', async () => {
      const expected = {
        message: 'Application submitted successfully',
      };

      opportunitiesService.applyToOpportunity.mockResolvedValue(expected);

      const result = await controller.applyToOpportunity(
        'student-1',
        'opportunity-1',
      );

      expect(
        opportunitiesService.applyToOpportunity,
      ).toHaveBeenCalledWith(
        'student-1',
        'opportunity-1',
      );

      expect(result).toEqual(expected);
    });
  });
});