import { OpportunityType } from '@prisma/client';

import { VoiceSearchCriteriaService } from './voice-search-criteria.service';

describe('VoiceSearchCriteriaService', () => {
  let service: VoiceSearchCriteriaService;

  beforeEach(() => {
    service = new VoiceSearchCriteriaService();
  });

  it('should extract remote internship and academic year', () => {
    const result = service.extract(
      'Find me remote AI internships for third-year students',
    );

    expect(result.type).toBe(
      OpportunityType.INTERNSHIP,
    );
    expect(result.isRemote).toBe(true);
    expect(result.minimumAcademicYear).toBe(3);
    expect(result.maximumAcademicYear).toBe(3);
    expect(result.keyword).toContain('AI');
  });

  it('should extract job type', () => {
    const result = service.extract(
      'Show me remote jobs',
    );

    expect(result.type).toBe(OpportunityType.JOB);
    expect(result.isRemote).toBe(true);
  });

  it('should extract scholarship type', () => {
    const result = service.extract(
      'Find scholarships',
    );

    expect(result.type).toBe(
      OpportunityType.SCHOLARSHIP,
    );
  });

  it('should extract fourth-year students', () => {
    const result = service.extract(
      'Find internships for fourth-year students',
    );

    expect(result.type).toBe(
      OpportunityType.INTERNSHIP,
    );
    expect(result.minimumAcademicYear).toBe(4);
    expect(result.maximumAcademicYear).toBe(4);
  });

    it('should extract Computer Science field', () => {
    const result = service.extract(
      'Find Computer Science internships',
    );

    expect(result.field).toBe('Computer Science');
  });

  it('should extract Software Engineering field', () => {
    const result = service.extract(
      'Find Software Engineering jobs',
    );

    expect(result.field).toBe('Software Engineering');
  });

  it('should extract Design field', () => {
    const result = service.extract(
      'Find Design internships',
    );

    expect(result.field).toBe('Design');
  });

  it('should return empty criteria for an unclear query', () => {
    const result = service.extract(
      'hello there',
    );

    expect(result).toEqual({});
  });

  it('should trim the query before extracting criteria', () => {
    const result = service.extract(
      '   remote internships   ',
    );

    expect(result.type).toBe(
      OpportunityType.INTERNSHIP,
    );
    expect(result.isRemote).toBe(true);
  });

  it('should remove articles from the extracted keyword', () => {
  expect(
    service.extract(
      'Find me a remote Python internship',
    ),
  ).toEqual({
    type: OpportunityType.INTERNSHIP,
    isRemote: true,
    keyword: 'Python',
  });
});
});