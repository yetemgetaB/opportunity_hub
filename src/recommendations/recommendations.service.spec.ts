import { Test, TestingModule } from '@nestjs/testing';

import { RecommendationsService } from './recommendations.service';
import { StudentProfileRepository } from '@/student-profile/student-profile.repository';
import { OpportunitiesService } from '@/opportunities/opportunities.service';

describe('RecommendationsService', () => {
  let service: RecommendationsService;

  const studentProfileRepository = {
    findByUserId: jest.fn(),
  };

  const opportunitiesService = {
    searchOpportunitiesForMatching: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          RecommendationsService,
          {
            provide: StudentProfileRepository,
            useValue: studentProfileRepository,
          },
          {
            provide: OpportunitiesService,
            useValue: opportunitiesService,
          },
        ],
      }).compile();

    service =
      module.get<RecommendationsService>(
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
      interests: ['Python'],
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

    opportunitiesService.searchOpportunitiesForMatching
      .mockResolvedValue([
        {
          id: 'opportunity-1',
          title: 'Python Internship',
          description:
            'Work with Python development.',
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
          description:
            'Work with Java development.',
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

    const results =
      await service.getRecommendations(
        'student-1',
      );

    expect(results).toHaveLength(2);

    expect(
      results[0].opportunity.id,
    ).toBe('opportunity-1');

    expect(results[0].score).toBeGreaterThan(
      results[1].score,
    );

    expect(
      results[0].matchedSkills,
    ).toEqual(['Python']);

    expect(
      results[0].matchedInterests,
    ).toEqual(['Python']);
  });

  it('should pass search filters to the opportunity search before matching', async () => {
    studentProfileRepository.findByUserId.mockResolvedValue({
      academicYear: 3,
      fieldOfStudy: 'Computer Science',
      location: 'Addis Ababa',
      interests: ['Python'],
      skills: [
        {
          skillId: 'skill-python',
          skill: {
            id: 'skill-python',
            name: 'Python',
          },
        },
      ],
    });

    opportunitiesService.searchOpportunitiesForMatching
      .mockResolvedValue([
        {
          id: 'opportunity-1',
          title: 'Python Internship',
          description:
            'Work with Python development.',
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
      ]);

    const searchQuery = {
      keyword: 'Python',
      field: 'Computer Science',
      location: 'Addis Ababa',
      skills: 'skill-python',
    };

    const results =
      await service.getRecommendations(
        'student-1',
        searchQuery,
      );

    expect(
      opportunitiesService
        .searchOpportunitiesForMatching,
    ).toHaveBeenCalledWith(searchQuery);

    expect(results).toHaveLength(1);
    expect(
      results[0].opportunity.id,
    ).toBe('opportunity-1');
  });

  it('should return a lower score when skills, field, year, and location do not match', async () => {
    studentProfileRepository.findByUserId.mockResolvedValue({
      academicYear: 3,
      fieldOfStudy: 'Computer Science',
      location: 'Addis Ababa',
      interests: ['Backend'],
      skills: [
        {
          skillId: 'skill-python',
          skill: {
            id: 'skill-python',
            name: 'Python',
          },
        },
      ],
    });

    opportunitiesService.searchOpportunitiesForMatching
      .mockResolvedValue([
        {
          id: 'opportunity-low',
          title: 'Graphic Design Internship',
          description:
            'Work on graphic design and UI/UX.',
          eligibleFields: ['Design'],
          minimumAcademicYear: 4,
          maximumAcademicYear: 5,
          location: 'Hawassa',
          isRemote: false,
          skills: [
            {
              skillId: 'skill-design',
              requirementLevel: 'REQUIRED',
              skill: {
                id: 'skill-design',
                name: 'Graphic Design',
              },
            },
          ],
        },
      ]);

    const results =
      await service.getRecommendations(
        'student-1',
      );

    expect(results).toHaveLength(1);
    expect(results[0].score).toBeLessThan(0.5);
    expect(results[0].matchedSkills).toEqual([]);
    expect(results[0].matchedInterests).toEqual([]);
  });

  it('should match student interests against the opportunity title and description', async () => {
    studentProfileRepository.findByUserId.mockResolvedValue({
      academicYear: 3,
      fieldOfStudy: 'Computer Science',
      location: 'Addis Ababa',
      interests: [
        'Machine Learning',
        'AI',
      ],
      skills: [],
    });

    opportunitiesService.searchOpportunitiesForMatching
      .mockResolvedValue([
        {
          id: 'opportunity-ai',
          title: 'AI Internship',
          description:
            'Work on machine learning projects.',
          eligibleFields: [],
          minimumAcademicYear: null,
          maximumAcademicYear: null,
          location: 'Addis Ababa',
          isRemote: false,
          skills: [],
        },
      ]);

    const results =
      await service.getRecommendations(
        'student-1',
      );

    expect(
      results[0].matchedInterests,
    ).toEqual([
      'Machine Learning',
      'AI',
    ]);

    expect(results[0].score).toBe(1);
  });

  it('should support remote opportunities regardless of student location', async () => {
    studentProfileRepository.findByUserId.mockResolvedValue({
      academicYear: 3,
      fieldOfStudy: 'Computer Science',
      location: 'Addis Ababa',
      interests: [],
      skills: [],
    });

    opportunitiesService.searchOpportunitiesForMatching
      .mockResolvedValue([
        {
          id: 'remote-opportunity',
          title: 'Remote Internship',
          description:
            'Remote software development opportunity.',
          eligibleFields: [],
          minimumAcademicYear: null,
          maximumAcademicYear: null,
          location: 'Hawassa',
          isRemote: true,
          skills: [],
        },
      ]);

    const results =
      await service.getRecommendations(
        'student-1',
      );

    expect(results[0].score).toBe(0.85);
  });

  it('should return an empty array when the student profile does not exist', async () => {
    studentProfileRepository.findByUserId.mockResolvedValue(null);

    const results =
      await service.getRecommendations(
        'student-1',
      );

    expect(results).toEqual([]);

    expect(
      opportunitiesService
        .searchOpportunitiesForMatching,
    ).not.toHaveBeenCalled();
  });
});