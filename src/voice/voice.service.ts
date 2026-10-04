import { Injectable, Optional } from '@nestjs/common';

import { VoiceSearchDto } from './dto/voice-search.dto';
import { OpportunitiesService } from '@/opportunities/opportunities.service';
import { SearchOpportunityDto } from '@/opportunities/dto/search-opportunity.dto';

@Injectable()
export class VoiceService {
  constructor(
    @Optional()
    private readonly opportunitiesService?: OpportunitiesService,
  ) {}

  /**
   * Execute a structured voice search query.
   * Maps voice-extracted intents into typed opportunity search filters,
   * supporting optional student profile context enrichment.
   */
  async search(query: VoiceSearchDto, studentUserId?: string) {
    if (!this.opportunitiesService) {
      return [];
    }

    const searchDto: SearchOpportunityDto = {
      keyword: query.keyword,
      type: query.type,
      isRemote: query.isRemote,
      location: query.location,
      field: query.field,
      fields: query.fields,
      academicYear: query.academicYear,
      skillIds: query.skillIds,
      skillNames: query.skills,
    };

    return this.opportunitiesService.searchOpportunities(
      searchDto,
      studentUserId,
    );
  }
}
