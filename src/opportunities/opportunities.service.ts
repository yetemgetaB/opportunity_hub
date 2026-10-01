import { Injectable } from '@nestjs/common';
import { OpportunitiesRepository } from './opportunities.repository';

@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly opportunitiesRepository: OpportunitiesRepository,
  ) {}
}