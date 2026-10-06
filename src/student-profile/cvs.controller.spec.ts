import { Test, TestingModule } from '@nestjs/testing';
import { CvsController } from './cvs.controller';
import { CvsService } from './cvs.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

describe('CvsController', () => {
  let controller: CvsController;
  let mockCvsService: any;

  const mockUserId = 'student-uuid-1111';
  const mockCvId = 'cv-uuid-2222';
  const mockCvResponse = {
    id: mockCvId,
    fileName: 'resume.pdf',
    fileType: 'application/pdf',
    fileSize: 1024,
    isDefault: true,
    uploadedAt: new Date(),
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'resume.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('mock pdf'),
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  };

  beforeEach(async () => {
    mockCvsService = {
      uploadCv: jest.fn().mockResolvedValue(mockCvResponse),
      getStudentCvs: jest.fn().mockResolvedValue([mockCvResponse]),
      setDefaultCv: jest.fn().mockResolvedValue({ ...mockCvResponse, isDefault: true }),
      getDownloadUrl: jest.fn().mockResolvedValue({
        downloadUrl: 'https://signed.url/cv.pdf',
        fileName: 'resume.pdf',
        expiresIn: 300,
      }),
      deleteCv: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvsController],
      providers: [{ provide: CvsService, useValue: mockCvsService }],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CvsController>(CvsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadCv', () => {
    it('should call cvsService.uploadCv with current userId and file', async () => {
      const result = await controller.uploadCv(mockUserId, mockFile, 'true');

      expect(result).toEqual(mockCvResponse);
      expect(mockCvsService.uploadCv).toHaveBeenCalledWith(
        mockUserId,
        mockFile,
        true,
      );
    });
  });

  describe('getMyCvs', () => {
    it('should return all CVs belonging to current student', async () => {
      const result = await controller.getMyCvs(mockUserId);

      expect(result).toEqual([mockCvResponse]);
      expect(mockCvsService.getStudentCvs).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('setDefaultCv', () => {
    it('should set specified CV as default', async () => {
      const result = await controller.setDefaultCv(mockUserId, mockCvId);

      expect(result.isDefault).toBe(true);
      expect(mockCvsService.setDefaultCv).toHaveBeenCalledWith(
        mockUserId,
        mockCvId,
      );
    });
  });

  describe('getDownloadUrl', () => {
    it('should return signed download URL', async () => {
      const result = await controller.getDownloadUrl(mockUserId, mockCvId);

      expect(result).toEqual({
        downloadUrl: 'https://signed.url/cv.pdf',
        fileName: 'resume.pdf',
        expiresIn: 300,
      });
      expect(mockCvsService.getDownloadUrl).toHaveBeenCalledWith(
        mockUserId,
        mockCvId,
      );
    });
  });

  describe('deleteCv', () => {
    it('should delete CV for current student', async () => {
      await controller.deleteCv(mockUserId, mockCvId);

      expect(mockCvsService.deleteCv).toHaveBeenCalledWith(
        mockUserId,
        mockCvId,
      );
    });
  });
});
