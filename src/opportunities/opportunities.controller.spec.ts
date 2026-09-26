import { Test, TestingModule } from '@nestjs/testing';

import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

describe('OpportunitiesController', () => {
  let controller: OpportunitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpportunitiesController],
      providers: [
        {
          provide: OpportunitiesService,
          useValue: {},
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

    controller = module.get<OpportunitiesController>(
      OpportunitiesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});