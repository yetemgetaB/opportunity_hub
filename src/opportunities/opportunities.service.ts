import { Injectable, NotFoundException } from '@nestjs/common';
import { OpportunitiesRepository } from './opportunities.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly opportunitiesRepository: OpportunitiesRepository,
    private readonly prisma: PrismaService,
  ) {}
}