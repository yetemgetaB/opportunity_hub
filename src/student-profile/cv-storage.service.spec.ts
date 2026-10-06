import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { CvStorageService } from './cv-storage.service';

jest.mock('@supabase/supabase-js');

describe('CvStorageService', () => {
  let service: CvStorageService;
  let mockConfigService: any;
  let mockStorageFrom: any;
  let mockSupabaseClient: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockStorageFrom = {
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      createSignedUrl: jest.fn(),
    };

    mockSupabaseClient = {
      storage: {
        from: jest.fn().mockReturnValue(mockStorageFrom),
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'database.supabaseUrl') return 'https://mock.supabase.co';
        if (key === 'database.supabaseServiceRoleKey') return 'mock-service-key';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvStorageService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CvStorageService>(CvStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildStoragePath', () => {
    it('should generate a deterministic storage path and sanitize special characters in filename', () => {
      const path = service.buildStoragePath(
        'student-123',
        'cv-456',
        'My Resume (Final) #2 [2026].pdf',
      );

      expect(path).toBe(
        'students/student-123/cvs/cv-456-My_Resume_Final_2_2026_.pdf',
      );
    });
  });

  describe('uploadCvFile', () => {
    it('should successfully upload buffer to resumes bucket', async () => {
      mockStorageFrom.upload.mockResolvedValue({ error: null });

      const buffer = Buffer.from('mock pdf');
      const result = await service.uploadCvFile(
        'students/usr-1/cvs/cv-1.pdf',
        buffer,
        'application/pdf',
      );

      expect(result).toEqual({ filePath: 'students/usr-1/cvs/cv-1.pdf' });
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('resumes');
      expect(mockStorageFrom.upload).toHaveBeenCalledWith(
        'students/usr-1/cvs/cv-1.pdf',
        buffer,
        { contentType: 'application/pdf', upsert: false },
      );
    });

    it('should throw InternalServerErrorException on upload failure', async () => {
      mockStorageFrom.upload.mockResolvedValue({
        error: { message: 'Bucket quota exceeded' },
      });

      await expect(
        service.uploadCvFile(
          'students/usr-1/cvs/cv-1.pdf',
          Buffer.from('data'),
          'application/pdf',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('downloadCvFile', () => {
    it('should download file from storage and return a Buffer', async () => {
      const mockBlob = {
        arrayBuffer: jest
          .fn()
          .mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
      };
      mockStorageFrom.download.mockResolvedValue({
        data: mockBlob,
        error: null,
      });

      const result = await service.downloadCvFile('students/usr-1/cvs/cv-1.pdf');

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result).toEqual(Buffer.from([1, 2, 3]));
      expect(mockStorageFrom.download).toHaveBeenCalledWith(
        'students/usr-1/cvs/cv-1.pdf',
      );
    });

    it('should throw NotFoundException if file does not exist or error occurs', async () => {
      mockStorageFrom.download.mockResolvedValue({
        data: null,
        error: { message: 'Object not found' },
      });

      await expect(
        service.downloadCvFile('students/usr-1/cvs/missing.pdf'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCvFile', () => {
    it('should delete file from storage bucket', async () => {
      mockStorageFrom.remove.mockResolvedValue({ error: null });

      await service.deleteCvFile('students/usr-1/cvs/cv-1.pdf');

      expect(mockStorageFrom.remove).toHaveBeenCalledWith([
        'students/usr-1/cvs/cv-1.pdf',
      ]);
    });

    it('should throw InternalServerErrorException on delete failure', async () => {
      mockStorageFrom.remove.mockResolvedValue({
        error: { message: 'Storage network timeout' },
      });

      await expect(
        service.deleteCvFile('students/usr-1/cvs/cv-1.pdf'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('createSignedDownloadUrl', () => {
    it('should generate signed URL for download', async () => {
      mockStorageFrom.createSignedUrl.mockResolvedValue({
        data: { signedUrl: 'https://mock.supabase.co/storage/v1/object/sign/resumes/signed-url' },
        error: null,
      });

      const url = await service.createSignedDownloadUrl(
        'students/usr-1/cvs/cv-1.pdf',
        300,
      );

      expect(url).toBe(
        'https://mock.supabase.co/storage/v1/object/sign/resumes/signed-url',
      );
      expect(mockStorageFrom.createSignedUrl).toHaveBeenCalledWith(
        'students/usr-1/cvs/cv-1.pdf',
        300,
      );
    });

    it('should throw InternalServerErrorException on signed URL generation failure', async () => {
      mockStorageFrom.createSignedUrl.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });

      await expect(
        service.createSignedDownloadUrl('students/usr-1/cvs/cv-1.pdf'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
