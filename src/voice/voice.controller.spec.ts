import { Test, TestingModule } from '@nestjs/testing';

import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { VoiceSearchDto } from './dto/voice-search.dto';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

describe('VoiceController', () => {
  let controller: VoiceController;

  const voiceService = {
    searchByVoice: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoiceController],
      providers: [
        {
          provide: VoiceService,
          useValue: voiceService,
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

    controller = module.get<VoiceController>(VoiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should pass the authenticated user and transcript to the voice service', async () => {
    const query: VoiceSearchDto = {
      query:
        'Find me remote AI internships for third-year students',
    };

    voiceService.searchByVoice.mockResolvedValue([]);

    const result = await controller.searchByVoice(
      'student-user-id',
      query,
    );

    expect(
      voiceService.searchByVoice,
    ).toHaveBeenCalledWith(
      'student-user-id',
      query,
    );

    expect(result).toEqual([]);
  });
});