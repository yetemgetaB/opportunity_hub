import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CvsRepository } from './cvs.repository';
import { CvStorageService } from './cv-storage.service';
import { CvTextExtractorService } from './cv-text-extractor.service';
import { StudentProfileRepository } from './student-profile.repository';

describe('CvsService', () => {
  let service: CvsService;
  let mockCvsRepo: any;
  let mockCvStorageService: any;
  let mockCvTextExtractorService: any;
  let mockStudentProfileRepo: any;

  const mockStudentId = 'student-uuid-1111';
  const mockCvId = 'cv-uuid-2222';
  const mockDate = new Date('2026-10-06T12:00:00Z');

  const mockCv = {
    id: mockCvId,
    studentProfileId: mockStudentId,
    fileName: 'resume.pdf',
    filePath: `students/${mockStudentId}/cvs/${mockCvId}-resume.pdf`,
    fileType: 'application/pdf',
    fileSize: 1024,
    isDefault: true,
    uploadedAt: mockDate,
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'resume.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('%PDF-1.4 test resume content'),
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  };

  beforeEach(async () => {
    mockCvsRepo = {
      create: jest.fn(),
      findManyByStudentId: jest.fn(),
      findByIdAndStudentId: jest.fn(),
      findPrimaryCvForStudent: jest.fn(),
      countByStudentId: jest.fn(),
      deleteByIdAndStudentId: jest.fn(),
      setDefault: jest.fn(),
    };

    mockCvStorageService = {
      buildStoragePath: jest.fn(
        (studentId, cvId, name) => `students/${studentId}/cvs/${cvId}-${name}`,
      ),
      uploadCvFile: jest.fn().mockResolvedValue({ filePath: 'mock-path' }),
      downloadCvFile: jest.fn().mockResolvedValue(Buffer.from('mock buffer')),
      deleteCvFile: jest.fn().mockResolvedValue(undefined),
      createSignedDownloadUrl: jest.fn().mockResolvedValue('https://signed.url/cv.pdf'),
    };

    mockCvTextExtractorService = {
      extractText: jest.fn().mockResolvedValue('Extracted CV text content'),
    };

    mockStudentProfileRepo = {
      findByUserId: jest.fn().mockResolvedValue({ userId: mockStudentId }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvsService,
        { provide: CvsRepository, useValue: mockCvsRepo },
        { provide: CvStorageService, useValue: mockCvStorageService },
        { provide: CvTextExtractorService, useValue: mockCvTextExtractorService },
        { provide: StudentProfileRepository, useValue: mockStudentProfileRepo },
      ],
    }).compile();

    service = module.get<CvsService>(CvsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateFile', () => {
    it('should throw BadRequestException if file is missing or has empty buffer', () => {
      expect(() => service.validateFile(undefined)).toThrow(BadRequestException);
      expect(() => service.validateFile({ buffer: null } as any)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if file size exceeds 10MB', () => {
      const oversizedFile = {
        ...mockFile,
        size: 11 * 1024 * 1024,
      };
      expect(() => service.validateFile(oversizedFile)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for legacy .doc files', () => {
      const docFile = {
        ...mockFile,
        originalname: 'resume.doc',
        mimetype: 'application/msword',
      };
      expect(() => service.validateFile(docFile)).toThrow(
        /Legacy \.doc format is not supported/,
      );
    });

    it('should throw BadRequestException for unsupported file formats (images/txt)', () => {
      const imageFile = {
        ...mockFile,
        originalname: 'resume.png',
        mimetype: 'image/png',
      };
      expect(() => service.validateFile(imageFile)).toThrow(
        /Unsupported file type/,
      );
    });

    it('should pass validation for valid PDF and DOCX files', () => {
      expect(() => service.validateFile(mockFile)).not.toThrow();

      const docxFile: Express.Multer.File = {
        ...mockFile,
        originalname: 'resume.docx',
        mimetype:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
      expect(() => service.validateFile(docxFile)).not.toThrow();
    });
  });

  describe('uploadCv', () => {
    it('should upload to storage and create DB record with isDefault=true for first upload', async () => {
      mockCvsRepo.countByStudentId.mockResolvedValue(0);
      mockCvsRepo.create.mockResolvedValue(mockCv);

      const result = await service.uploadCv(mockStudentId, mockFile);

      expect(result).toEqual({
        id: mockCv.id,
        fileName: mockCv.fileName,
        fileType: mockCv.fileType,
        fileSize: mockCv.fileSize,
        isDefault: true,
        uploadedAt: mockCv.uploadedAt,
      });
      expect(mockCvStorageService.uploadCvFile).toHaveBeenCalled();
      expect(mockCvsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          studentProfileId: mockStudentId,
          fileName: 'resume.pdf',
          fileType: 'application/pdf',
          isDefault: true,
        }),
      );
    });

    it('should perform compensating storage cleanup if database record creation fails', async () => {
      mockCvsRepo.countByStudentId.mockResolvedValue(0);
      mockCvsRepo.create.mockRejectedValue(new Error('Prisma database constraint error'));

      await expect(service.uploadCv(mockStudentId, mockFile)).rejects.toThrow(
        'Prisma database constraint error',
      );

      expect(mockCvStorageService.uploadCvFile).toHaveBeenCalled();
      expect(mockCvStorageService.deleteCvFile).toHaveBeenCalled();
    });

    it('should throw NotFoundException if student profile does not exist', async () => {
      mockStudentProfileRepo.findByUserId.mockResolvedValue(null);

      await expect(service.uploadCv(mockStudentId, mockFile)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCvStorageService.uploadCvFile).not.toHaveBeenCalled();
    });
  });

  describe('getStudentCvs', () => {
    it('should return list of mapped CVs for student', async () => {
      mockCvsRepo.findManyByStudentId.mockResolvedValue([mockCv]);

      const result = await service.getStudentCvs(mockStudentId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockCv.id);
      expect((result[0] as any).filePath).toBeUndefined(); // Verify filePath is shielded
    });
  });

  describe('deleteCv', () => {
    it('should delete storage file and database record when student owns the CV', async () => {
      mockCvsRepo.findByIdAndStudentId.mockResolvedValue(mockCv);
      mockCvsRepo.deleteByIdAndStudentId.mockResolvedValue(mockCv);

      await service.deleteCv(mockStudentId, mockCvId);

      expect(mockCvStorageService.deleteCvFile).toHaveBeenCalledWith(mockCv.filePath);
      expect(mockCvsRepo.deleteByIdAndStudentId).toHaveBeenCalledWith(
        mockCvId,
        mockStudentId,
      );
    });

    it('should throw NotFoundException if CV does not belong to the student', async () => {
      mockCvsRepo.findByIdAndStudentId.mockResolvedValue(null);

      await expect(service.deleteCv(mockStudentId, 'other-cv')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCvStorageService.deleteCvFile).not.toHaveBeenCalled();
      expect(mockCvsRepo.deleteByIdAndStudentId).not.toHaveBeenCalled();
    });
  });

  describe('setDefaultCv', () => {
    it('should mark CV as default when student owns the CV', async () => {
      mockCvsRepo.findByIdAndStudentId.mockResolvedValue(mockCv);
      mockCvsRepo.setDefault.mockResolvedValue({ ...mockCv, isDefault: true });

      const result = await service.setDefaultCv(mockStudentId, mockCvId);

      expect(result.isDefault).toBe(true);
      expect(mockCvsRepo.setDefault).toHaveBeenCalledWith(mockCvId, mockStudentId);
    });

    it('should throw NotFoundException if target CV is not owned by the student', async () => {
      mockCvsRepo.findByIdAndStudentId.mockResolvedValue(null);

      await expect(service.setDefaultCv(mockStudentId, 'other-cv')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getDownloadUrl', () => {
    it('should return signed URL for student-owned CV', async () => {
      mockCvsRepo.findByIdAndStudentId.mockResolvedValue(mockCv);

      const result = await service.getDownloadUrl(mockStudentId, mockCvId);

      expect(result).toEqual({
        downloadUrl: 'https://signed.url/cv.pdf',
        fileName: 'resume.pdf',
        expiresIn: 300,
      });
      expect(mockCvStorageService.createSignedDownloadUrl).toHaveBeenCalledWith(
        mockCv.filePath,
        300,
      );
    });

    it('should throw NotFoundException when student attempts to download unowned CV', async () => {
      mockCvsRepo.findByIdAndStudentId.mockResolvedValue(null);

      await expect(
        service.getDownloadUrl(mockStudentId, 'unowned-cv'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCvTextForStudent (Day 13 Boundary)', () => {
    it('should return extracted text when primary CV exists and is parsed successfully', async () => {
      mockCvsRepo.findPrimaryCvForStudent.mockResolvedValue(mockCv);
      mockCvStorageService.downloadCvFile.mockResolvedValue(Buffer.from('pdf data'));
      mockCvTextExtractorService.extractText.mockResolvedValue('Parsed CV text content');

      const result = await service.getCvTextForStudent(mockStudentId);

      expect(result).toBe('Parsed CV text content');
      expect(mockCvsRepo.findPrimaryCvForStudent).toHaveBeenCalledWith(mockStudentId);
      expect(mockCvStorageService.downloadCvFile).toHaveBeenCalledWith(mockCv.filePath);
      expect(mockCvTextExtractorService.extractText).toHaveBeenCalledWith(
        expect.any(Buffer),
        mockCv.fileType,
      );
    });

    it('should return null if student has no uploaded CVs', async () => {
      mockCvsRepo.findPrimaryCvForStudent.mockResolvedValue(null);

      const result = await service.getCvTextForStudent(mockStudentId);

      expect(result).toBeNull();
      expect(mockCvStorageService.downloadCvFile).not.toHaveBeenCalled();
    });

    it('should return null gracefully if storage download fails', async () => {
      mockCvsRepo.findPrimaryCvForStudent.mockResolvedValue(mockCv);
      mockCvStorageService.downloadCvFile.mockRejectedValue(
        new NotFoundException('Storage object missing'),
      );

      const result = await service.getCvTextForStudent(mockStudentId);

      expect(result).toBeNull();
    });

    it('should return null gracefully if text extraction fails or returns null', async () => {
      mockCvsRepo.findPrimaryCvForStudent.mockResolvedValue(mockCv);
      mockCvStorageService.downloadCvFile.mockResolvedValue(Buffer.from('corrupted data'));
      mockCvTextExtractorService.extractText.mockResolvedValue(null);

      const result = await service.getCvTextForStudent(mockStudentId);

      expect(result).toBeNull();
    });
  });
});
