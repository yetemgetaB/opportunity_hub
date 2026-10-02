import { Test, TestingModule } from '@nestjs/testing';

import { RecommendationsService } from './recommendations.service';
import { StudentProfileRepository } from '@/student-profile/student-profile.repository';
import { OpportunitiesRepository } from '@/opportunities/opportunities.repository';

describe('RecommendationsService', () => {
  let service: RecommendationsService;

  const studentProfileRepository = {
    findByUserId: jest.fn(),
  };

  const opportunitiesRepository = {
    findMany: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        {
          provide: StudentProfileRepository,
          useValue: studentProfileRepository,
        },
        {
          provide: OpportunitiesRepository,
          useValue: opportunitiesRepository,
        },
      ],
    }).compile();

    service = module.get<RecommendationsService>(
      RecommendationsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return recommendations ordered by match score', async () => {
    studentProfileRepository.findByUserId.mockResolvedValue({
      academicYear: 3,
      fieldOfStudy: 'Computer Science',
      location: 'Addis Ababa',
      skills: [
        {
          skillId: 'skill-python',
          skill: {
            id: 'skill-python',
            name: 'Python',
          },
        },
        {
          skillId: 'skill-javascript',
          skill: {
            id: 'skill-javascript',
            name: 'JavaScript',
          },
        },
      ],
    });

    opportunitiesRepository.findMany.mockResolvedValue([
      {
        id: 'opportunity-1',
        title: 'Python Internship',
        eligibleFields: ['Computer Science'],
        minimumAcademicYear: 2,
        maximumAcademicYear: 4,
        location: 'Addis Ababa',
        isRemote: false,
        skills: [
          {
            skillId: 'skill-python',
            requirementLevel: 'REQUIRED',
            skill: {
              id: 'skill-python',
              name: 'Python',
            },
          },
        ],
      },
      {
        id: 'opportunity-2',
        title: 'Java Internship',
        eligibleFields: ['Computer Science'],
        minimumAcademicYear: 4,
        maximumAcademicYear: 5,
        location: 'Addis Ababa',
        isRemote: false,
        skills: [
          {
            skillId: 'skill-java',
            requirementLevel: 'REQUIRED',
            skill: {
              id: 'skill-java',
              name: 'Java',
            },
          },
        ],
      },
    ]);

    const results = await service.getRecommendations('student-1');

    expect(results).toHaveLength(2);

    expect(results[0].opportunity.id).toBe('opportunity-1');
    expect(results[0].score).toBeGreaterThan(results[1].score);
    expect(results[0].matchedSkills).toEqual(['Python']);
  });

  it('should return an empty array when the student profile does not exist', async () => {
    studentProfileRepository.findByUserId.mockResolvedValue(null);

    const results = await service.getRecommendations('student-1');

    expect(results).toEqual([]);
    expect(opportunitiesRepository.findMany).not.toHaveBeenCalled();
  });
});