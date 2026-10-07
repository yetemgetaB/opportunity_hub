import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { RecommendationsService } from '@/recommendations/recommendations.service';
import { VoiceSearchCriteriaService } from './voice-search-criteria.service';
import { VoiceSearchDto } from './dto/voice-search.dto';
import { StudentProfileRepository } from '@/student-profile/student-profile.repository';

@Injectable()
export class VoiceService {
  constructor(
    private readonly recommendationsService: RecommendationsService,
    private readonly voiceSearchCriteriaService: VoiceSearchCriteriaService,
    private readonly studentProfileRepository: StudentProfileRepository,
  ) {}

  async searchByVoice(
    userId: string,
    query: VoiceSearchDto,
  ) {
    const transcript = query.query.trim();

    if (!transcript) {
      throw new BadRequestException(
        'Voice search query cannot be empty.',
      );
    }

    const studentProfile =
      await this.studentProfileRepository.findByUserId(userId);

    if (!studentProfile) {
      throw new NotFoundException(
        'Student profile not found. Please complete your profile before using voice search.',
      );
    }

    const criteria =
      this.voiceSearchCriteriaService.extract(transcript);

    if (Object.keys(criteria).length === 0) {
      throw new BadRequestException(
        'Unable to understand the search request. Please provide an opportunity type, location, academic year, or relevant keyword.',
      );
    }

    const results =
      await this.recommendationsService.getRecommendations(
        userId,
        criteria,
      );

    return {
      results,
      message:
        results.length > 0
          ? 'Matching opportunities found.'
          : 'No matching opportunities were found. Try changing your search criteria.',
    };
  }
}