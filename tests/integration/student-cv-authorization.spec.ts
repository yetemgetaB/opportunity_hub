import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CvsService } from '@/student-profile/cvs.service';
import { CvsRepository } from '@/student-profile/cvs.repository';
import { CvStorageService } from '@/student-profile/cv-storage.service';
import { CvTextExtractorService } from '@/student-profile/cv-text-extractor.service';
import { StudentProfileRepository } from '@/student-profile/student-profile.repository';
import { PrismaService } from '@/prisma/prisma.service';

describe('Student CV Authorization & Multi-Tenant Boundary Integration', () => {
  let service: CvsService;
  let mockPrisma: any;
  let mockCvStorage: any;

  const studentA = 'student-uuid-aaaa-1111';
  const studentB = 'student-uuid-bbbb-2222';

  const cvA = {
    id: 'cv-uuid-aaaa-1111',
    studentProfileId: studentA,
    fileName: 'studentA_resume.pdf',
    filePath: `students/${studentA}/cvs/cv-uuid-aaaa-1111-studentA_resume.pdf`,
    fileType: 'application/pdf',
    fileSize: 2048,
    isDefault: true,
    uploadedAt: new Date('2026-10-01T10:00:00Z'),
  };

  const cvB = {
    id: 'cv-uuid-bbbb-2222',
    studentProfileId: studentB,
    fileName: 'studentB_resume.pdf',
    filePath: `students/${studentB}/cvs/cv-uuid-bbbb-2222-studentB_resume.pdf`,
    fileType: 'application/pdf',
    fileSize: 4096,
    isDefault: true,
    uploadedAt: new Date('2026-10-02T10:00:00Z'),
  };

  const cvStore = new Map<string, any>([
    [cvA.id, { ...cvA }],
    [cvB.id, { ...cvB }],
  ]);

  beforeEach(async () => {
    mockPrisma = {
      cV: {
        findMany: jest.fn(
          async ({ where }: { where: { studentProfileId: string } }) => {
            return Array.from(cvStore.values()).filter(
              (c) => c.studentProfileId === where.studentProfileId,
            );
          },
        ),
        findFirst: jest.fn(
          async ({
            where,
          }: {
            where: { id?: string; studentProfileId: string };
          }) => {
            return (
              Array.from(cvStore.values()).find((c) => {
                if (where.id && c.id !== where.id) return false;
                return c.studentProfileId === where.studentProfileId;
              }) || null
            );
          },
        ),
        delete: jest.fn(async ({ where }: { where: { id: string } }) => {
          const item = cvStore.get(where.id);
          if (item) {
            cvStore.delete(where.id);
          }
          return item;
        }),
        update: jest.fn(
          async ({
            where,
            data,
          }: {
            where: { id: string };
            data: { isDefault: boolean };
          }) => {
            const item = cvStore.get(where.id);
            if (item) {
              item.isDefault = data.isDefault;
            }
            return item;
          },
        ),
        updateMany: jest.fn(
          async ({
            where,
            data,
          }: {
            where: { studentProfileId: string; isDefault?: boolean };
            data: { isDefault: boolean };
          }) => {
            let count = 0;
            for (const item of cvStore.values()) {
              if (item.studentProfileId === where.studentProfileId) {
                item.isDefault = data.isDefault;
                count++;
              }
            }
            return { count };
          },
        ),
      },
      $transaction: jest.fn(async (callback) => {
        return callback(mockPrisma);
      }),
    };

    mockCvStorage = {
      deleteCvFile: jest.fn().mockResolvedValue(undefined),
      createSignedDownloadUrl: jest.fn(
        async (path) => `https://signed.storage.url/${path}`,
      ),
      downloadCvFile: jest.fn(async () => Buffer.from('mock pdf')),
    };

    const mockTextExtractor = {
      extractText: jest.fn().mockResolvedValue('Mock Extracted CV Text'),
    };

    const mockStudentProfileRepo = {
      findByUserId: jest.fn(async (userId) => ({ userId })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvsService,
        CvsRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CvStorageService, useValue: mockCvStorage },
        { provide: CvTextExtractorService, useValue: mockTextExtractor },
        { provide: StudentProfileRepository, useValue: mockStudentProfileRepo },
      ],
    }).compile();

    service = module.get<CvsService>(CvsService);
  });

  describe('Cross-Student Access Prevention', () => {
    it('should prevent Student A from listing Student B CVs', async () => {
      const cvsA = await service.getStudentCvs(studentA);
      expect(cvsA).toHaveLength(1);
      expect(cvsA[0].id).toBe(cvA.id);

      const cvsB = await service.getStudentCvs(studentB);
      expect(cvsB).toHaveLength(1);
      expect(cvsB[0].id).toBe(cvB.id);
    });

    it('should reject Student A trying to delete Student B CV', async () => {
      await expect(service.deleteCv(studentA, cvB.id)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCvStorage.deleteCvFile).not.toHaveBeenCalled();
      expect(cvStore.has(cvB.id)).toBe(true);
    });

    it('should reject Student A trying to set Student B CV as default', async () => {
      await expect(service.setDefaultCv(studentA, cvB.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should reject Student A trying to get download URL for Student B CV', async () => {
      await expect(service.getDownloadUrl(studentA, cvB.id)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCvStorage.createSignedDownloadUrl).not.toHaveBeenCalled();
    });

    it('should isolate getCvTextForStudent strictly to the requested studentProfileId', async () => {
      const textA = await service.getCvTextForStudent(studentA);
      expect(textA).toBe('Mock Extracted CV Text');
      expect(mockCvStorage.downloadCvFile).toHaveBeenCalledWith(cvA.filePath);

      const textB = await service.getCvTextForStudent(studentB);
      expect(textB).toBe('Mock Extracted CV Text');
      expect(mockCvStorage.downloadCvFile).toHaveBeenCalledWith(cvB.filePath);
    });
  });
});
