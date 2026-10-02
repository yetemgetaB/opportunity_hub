import { Test, TestingModule } from '@nestjs/testing';
import { OpportunityStatus, OpportunityType, UserRole } from '@prisma/client';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { SearchOpportunityDto } from './dto/search-opportunity.dto';

describe('OpportunitiesController', () => {
  let controller: OpportunitiesController;
  let service: OpportunitiesService;

  const mockService = {
    createOpportunity: jest.fn(),
    getMyOpportunities: jest.fn(),
    getMyOpportunity: jest.fn(),
    updateOpportunity: jest.fn(),
    deleteOpportunity: jest.fn(),
    publishOpportunity: jest.fn(),
    searchOpportunities: jest.fn(),
    getPublishedOpportunity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpportunitiesController],
      providers: [
        {
          provide: OpportunitiesService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<OpportunitiesController>(OpportunitiesController);
    service = module.get<OpportunitiesService>(OpportunitiesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('createOpportunity', () => {
    it('should call service.createOpportunity with userId and dto', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const dto: CreateOpportunityDto = {
        title: 'Software Engineer Intern',
        description: 'Great internship opportunity',
        opportunityType: OpportunityType.INTERNSHIP,
      };
      const expectedResult = { id: 'opp-1', ...dto };
      mockService.createOpportunity.mockResolvedValue(expectedResult);

      const result = await controller.createOpportunity(userId, dto);
      expect(service.createOpportunity).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getMyOpportunities', () => {
    it('should call service.getMyOpportunities with userId', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const expectedList = [{ id: 'opp-1', title: 'Internship' }];
      mockService.getMyOpportunities.mockResolvedValue(expectedList);

      const result = await controller.getMyOpportunities(userId);
      expect(service.getMyOpportunities).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedList);
    });
  });

  describe('getMyOpportunity', () => {
    it('should call service.getMyOpportunity with userId and opportunityId', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const oppId = '22222222-2222-2222-2222-222222222222';
      const expectedOpp = { id: oppId, title: 'Internship' };
      mockService.getMyOpportunity.mockResolvedValue(expectedOpp);

      const result = await controller.getMyOpportunity(userId, oppId);
      expect(service.getMyOpportunity).toHaveBeenCalledWith(userId, oppId);
      expect(result).toEqual(expectedOpp);
    });
  });

  describe('updateOpportunity', () => {
    it('should call service.updateOpportunity with userId, opportunityId, and dto', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const oppId = '22222222-2222-2222-2222-222222222222';
      const dto: UpdateOpportunityDto = {
        title: 'Senior Software Engineer Intern',
      };
      const expectedOpp = { id: oppId, ...dto };
      mockService.updateOpportunity.mockResolvedValue(expectedOpp);

      const result = await controller.updateOpportunity(userId, oppId, dto);
      expect(service.updateOpportunity).toHaveBeenCalledWith(userId, oppId, dto);
      expect(result).toEqual(expectedOpp);
    });
  });

  describe('deleteOpportunity', () => {
    it('should call service.deleteOpportunity with userId and opportunityId', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const oppId = '22222222-2222-2222-2222-222222222222';
      const expectedResponse = { message: 'Opportunity deleted successfully.' };
      mockService.deleteOpportunity.mockResolvedValue(expectedResponse);

      const result = await controller.deleteOpportunity(userId, oppId);
      expect(service.deleteOpportunity).toHaveBeenCalledWith(userId, oppId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('publishOpportunity', () => {
    it('should call service.publishOpportunity with userId and opportunityId', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const oppId = '22222222-2222-2222-2222-222222222222';
      const expectedOpp = { id: oppId, status: OpportunityStatus.PUBLISHED };
      mockService.publishOpportunity.mockResolvedValue(expectedOpp);

      const result = await controller.publishOpportunity(userId, oppId);
      expect(service.publishOpportunity).toHaveBeenCalledWith(userId, oppId);
      expect(result).toEqual(expectedOpp);
    });
  });

  describe('placeholders and public routes', () => {
    it('applyToOpportunity returns student protected message', () => {
      const oppId = '22222222-2222-2222-2222-222222222222';
      const result = controller.applyToOpportunity(oppId);
      expect(result).toEqual({
        message: 'Student opportunity application endpoint is protected.',
        opportunityId: oppId,
        role: UserRole.STUDENT,
      });
    });

    it('createAssessment returns organization assessment protected message', () => {
      const oppId = '22222222-2222-2222-2222-222222222222';
      const result = controller.createAssessment(oppId);
      expect(result).toEqual({
        message: 'Organization opportunity assessment endpoint is protected.',
        opportunityId: oppId,
        role: UserRole.ORGANIZATION,
      });
    });

    it('searchOpportunities calls service.searchOpportunities', async () => {
      const query: SearchOpportunityDto = { location: 'Addis Ababa' };
      const expected = [{ id: 'opp-1', title: 'Dev' }];
      mockService.searchOpportunities.mockResolvedValue(expected);

      const result = await controller.searchOpportunities(query);
      expect(service.searchOpportunities).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });

    it('getOpportunity calls service.getPublishedOpportunity', async () => {
      const oppId = '22222222-2222-2222-2222-222222222222';
      const expected = { id: oppId, title: 'Dev' };
      mockService.getPublishedOpportunity.mockResolvedValue(expected);

      const result = await controller.getOpportunity(oppId);
      expect(service.getPublishedOpportunity).toHaveBeenCalledWith(oppId);
      expect(result).toEqual(expected);
    });
  });
});