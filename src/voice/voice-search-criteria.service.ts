import { Injectable } from '@nestjs/common';
import { OpportunityType } from '@prisma/client';

import { OpportunitySearchCriteria } from '@/opportunities/opportunity-search.interface';

@Injectable()
export class VoiceSearchCriteriaService {
  extract(query: string): OpportunitySearchCriteria {
    const normalizedQuery = query.trim().toLowerCase();

    const criteria: OpportunitySearchCriteria = {};

    const opportunityType = this.extractOpportunityType(
      normalizedQuery,
    );

    if (opportunityType) {
      criteria.type = opportunityType;
    }

    if (
      /\b(remote|remotely|work from home)\b/.test(
        normalizedQuery,
      )
    ) {
      criteria.isRemote = true;
    }

    const academicYear =
      this.extractAcademicYear(normalizedQuery);

    if (academicYear !== undefined) {
      criteria.minimumAcademicYear = academicYear;
      criteria.maximumAcademicYear = academicYear;
    }

    const field = this.extractField(normalizedQuery);

        if (field) {
        criteria.field = field;
        }
const hasStructuredCriteria =
  opportunityType !== undefined ||
  criteria.isRemote === true ||
  academicYear !== undefined ||
  field !== undefined;

if (!hasStructuredCriteria) {
  return {};
}

const keyword = this.extractKeyword(
  query,
  opportunityType,
  academicYear,
);

if (keyword) {
  criteria.keyword = keyword;
}

    return criteria;
  }

  private extractOpportunityType(
    query: string,
  ): OpportunityType | undefined {
    const typeMap: Array<{
      keywords: string[];
      type: OpportunityType;
    }> = [
      {
        keywords: ['internship', 'intern'],
        type: OpportunityType.INTERNSHIP,
      },
      {
        keywords: ['job', 'jobs', 'employment'],
        type: OpportunityType.JOB,
      },
      {
        keywords: ['scholarship', 'scholarships'],
        type: OpportunityType.SCHOLARSHIP,
      },
      {
        keywords: ['hackathon', 'hackathons'],
        type: OpportunityType.HACKATHON,
      },
      {
        keywords: ['competition', 'competitions'],
        type: OpportunityType.COMPETITION,
      },
      {
        keywords: ['training', 'trainings', 'course', 'courses'],
        type: OpportunityType.TRAINING,
      },
      {
        keywords: ['volunteer', 'volunteering'],
        type: OpportunityType.VOLUNTEER,
      },
      {
        keywords: ['fellowship', 'fellowships'],
        type: OpportunityType.FELLOWSHIP,
      },
    ];

    const match = typeMap.find(({ keywords }) =>
      keywords.some((keyword) =>
        query.includes(keyword),
      ),
    );

    return match?.type;
  }

  private extractAcademicYear(
    query: string,
  ): number | undefined {
    const match = query.match(
    /\b(?:first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th)[-\s]+year\b/,
    );

    if (!match) {
      return undefined;
    }

    const yearMap: Record<string, number> = {
      first: 1,
      '1st': 1,
      second: 2,
      '2nd': 2,
      third: 3,
      '3rd': 3,
      fourth: 4,
      '4th': 4,
      fifth: 5,
      '5th': 5,
    };

    const value = match[0]
  .toLowerCase()
  .replace('-', ' ')
  .split(' ')[0];

    return yearMap[value];
  }

  private extractField(
  query: string,
): string | undefined {
  const fieldMap: Array<{
    keywords: string[];
    field: string;
  }> = [
    {
      keywords: [
        'computer science',
        'cs',
      ],
      field: 'Computer Science',
    },
    {
      keywords: [
        'software engineering',
        'software development',
      ],
      field: 'Software Engineering',
    },
    {
      keywords: ['design'],
      field: 'Design',
    },
  ];

  const match = fieldMap.find(({ keywords }) =>
    keywords.some((keyword) =>
      query.includes(keyword),
    ),
  );

  return match?.field;
}

  private extractKeyword(
    originalQuery: string,
    opportunityType?: OpportunityType,
    academicYear?: number,
  ): string | undefined {
    const normalized = originalQuery
      .trim()
      .replace(/[?.!,]/g, '');

    let keyword = normalized;

    const phrasesToRemove = [
  /\bfind me\b/gi,
  /\bfind\b/gi,
  /\bshow me\b/gi,
  /\bshow\b/gi,
  /\blooking for\b/gi,
  /\bthat are\b/gi,
  /\bfor\b/gi,
  /\bremote\b/gi,
  /\bremotely\b/gi,
  /\bwork from home\b/gi,

  /\bfirst year\b/gi,
  /\b1st year\b/gi,
  /\bfirst-year\b/gi,
  /\b1st-year\b/gi,

  /\bsecond year\b/gi,
  /\b2nd year\b/gi,
  /\bsecond-year\b/gi,
  /\b2nd-year\b/gi,

  /\bthird year\b/gi,
  /\b3rd year\b/gi,
  /\bthird-year\b/gi,
  /\b3rd-year\b/gi,

  /\bfourth year\b/gi,
  /\b4th year\b/gi,
  /\bfourth-year\b/gi,
  /\b4th-year\b/gi,

  /\bfifth year\b/gi,
  /\b5th year\b/gi,
  /\bfifth-year\b/gi,
  /\b5th-year\b/gi,

  /\bstudents?\b/gi,
    /\ba\b/gi,
  /\ban\b/gi,
];

    for (const phrase of phrasesToRemove) {
      keyword = keyword.replace(phrase, ' ');
    }

    if (opportunityType) {
      keyword = keyword.replace(
        new RegExp(
          `\\b${opportunityType.toLowerCase()}s?\\b`,
          'gi',
        ),
        ' ',
      );
    }

    keyword = keyword
      .replace(/\s+/g, ' ')
      .trim();

    if (!keyword || academicYear !== undefined) {
      return keyword || undefined;
    }

    return keyword;
  }
}