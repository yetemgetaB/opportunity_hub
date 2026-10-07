import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import 'multer';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { CV } from '@prisma/client';

import { CvsRepository } from './cvs.repository';
import { CvStorageService } from './cv-storage.service';
import { CvTextExtractorService } from './cv-text-extractor.service';
import { StudentProfileRepository } from './student-profile.repository';
import { CvResponseDto } from './dto/cv-response.dto';

@Injectable()
export class CvsService {
  private readonly logger = new Logger(CvsService.name);

  public static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  public static readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  public static readonly ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

  constructor(
    private readonly cvsRepository: CvsRepository,
    private readonly cvStorageService: CvStorageService,
    private readonly cvTextExtractorService: CvTextExtractorService,
    private readonly studentProfileRepository: StudentProfileRepository,
  ) {}

  /**
   * Validate uploaded CV file.
   */
  public validateFile(file?: Express.Multer.File): void {
    if (!file || !file.buffer) {
      throw new BadRequestException('File is required.');
    }

    if (file.size === 0) {
      throw new BadRequestException('Uploaded file is empty.');
    }

    if (file.size > CvsService.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds the 10MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
      );
    }

    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = file.mimetype?.toLowerCase();

    if (ext === '.doc' || mime === 'application/msword') {
      throw new BadRequestException(
        'Legacy .doc format is not supported. Please upload your CV as a modern .docx or .pdf file.',
      );
    }

    const isAllowedExt = CvsService.ALLOWED_EXTENSIONS.includes(ext);
    const isAllowedMime = CvsService.ALLOWED_MIME_TYPES.includes(mime);

    if (!isAllowedExt || !isAllowedMime) {
      throw new BadRequestException(
        'Unsupported file type. Only PDF (.pdf) and Microsoft Word (.docx) files are supported.',
      );
    }
  }

  /**
   * Upload and register a student CV.
   * Uploads to Supabase Storage first, then creates the DB record.
   * Performs compensating cleanup if DB record creation fails.
   */
  async uploadCv(
    studentProfileId: string,
    file: Express.Multer.File,
    isDefault?: boolean,
  ): Promise<CvResponseDto> {
    this.validateFile(file);

    const profile =
      await this.studentProfileRepository.findByUserId(studentProfileId);
    if (!profile) {
      throw new NotFoundException(
        'Student profile not found. Please create your profile before uploading a CV.',
      );
    }

    const existingCount =
      await this.cvsRepository.countByStudentId(studentProfileId);

    // If student has no CVs, first CV is default automatically
    const targetIsDefault = isDefault === true || existingCount === 0;

    const cvId = randomUUID();
    const filePath = this.cvStorageService.buildStoragePath(
      studentProfileId,
      cvId,
      file.originalname,
    );

    // 1. Upload to storage
    await this.cvStorageService.uploadCvFile(
      filePath,
      file.buffer,
      file.mimetype,
    );

    // 2. Persist to database (with compensating rollback on error)
    try {
      let createdCv: CV;

      if (targetIsDefault && existingCount > 0) {
        createdCv = await this.cvsRepository.create({
          id: cvId,
          studentProfileId,
          fileName: file.originalname,
          filePath,
          fileType: file.mimetype,
          fileSize: file.size,
          isDefault: false,
        });

        createdCv = await this.cvsRepository.setDefault(
          createdCv.id,
          studentProfileId,
        );
      } else {
        createdCv = await this.cvsRepository.create({
          id: cvId,
          studentProfileId,
          fileName: file.originalname,
          filePath,
          fileType: file.mimetype,
          fileSize: file.size,
          isDefault: targetIsDefault,
        });
      }

      this.logger.log(
        `Successfully registered CV [${createdCv.id}] for student [${studentProfileId}]`,
      );

      return this.mapCvToResponse(createdCv);
    } catch (dbError: any) {
      this.logger.error(
        `Database insertion failed for CV [${cvId}]. Performing compensating storage deletion for [${filePath}]: ${dbError.message}`,
      );

      try {
        await this.cvStorageService.deleteCvFile(filePath);
      } catch (cleanupError: any) {
        this.logger.error(
          `Compensating storage cleanup failed for [${filePath}]: ${cleanupError.message}`,
        );
      }

      throw dbError;
    }
  }

  /**
   * List all CVs for the authenticated student.
   */
  async getStudentCvs(studentProfileId: string): Promise<CvResponseDto[]> {
    const cvs = await this.cvsRepository.findManyByStudentId(studentProfileId);
    return cvs.map((cv) => this.mapCvToResponse(cv));
  }

  /**
   * Delete a student's CV from both storage and database.
   */
  async deleteCv(studentProfileId: string, cvId: string): Promise<void> {
    const existing = await this.cvsRepository.findByIdAndStudentId(
      cvId,
      studentProfileId,
    );

    if (!existing) {
      throw new NotFoundException('CV not found.');
    }

    // 1. Delete storage file first
    await this.cvStorageService.deleteCvFile(existing.filePath);

    // 2. Delete database record
    await this.cvsRepository.deleteByIdAndStudentId(cvId, studentProfileId);

    this.logger.log(
      `Successfully deleted CV [${cvId}] for student [${studentProfileId}]`,
    );
  }

  /**
   * Mark a specific CV as default for the student.
   */
  async setDefaultCv(
    studentProfileId: string,
    cvId: string,
  ): Promise<CvResponseDto> {
    const existing = await this.cvsRepository.findByIdAndStudentId(
      cvId,
      studentProfileId,
    );

    if (!existing) {
      throw new NotFoundException('CV not found.');
    }

    const updated = await this.cvsRepository.setDefault(
      cvId,
      studentProfileId,
    );
    return this.mapCvToResponse(updated);
  }

  /**
   * Generate temporary signed download URL for student's own CV.
   */
  async getDownloadUrl(
    studentProfileId: string,
    cvId: string,
  ): Promise<{ downloadUrl: string; fileName: string; expiresIn: number }> {
    const cv = await this.cvsRepository.findByIdAndStudentId(
      cvId,
      studentProfileId,
    );

    if (!cv) {
      throw new NotFoundException('CV not found.');
    }

    const signedUrl = await this.cvStorageService.createSignedDownloadUrl(
      cv.filePath,
      300,
    );

    return {
      downloadUrl: signedUrl,
      fileName: cv.fileName,
      expiresIn: 300,
    };
  }

  /**
   * Public service boundary for Day 13 Applicant Analysis:
   * Retrieves the student's primary CV, downloads file from Supabase Storage,
   * extracts normalized text, and returns string | null.
   *
   * Priority:
   * 1. Default CV
   * 2. Latest uploaded CV
   */
  async getCvTextForStudent(
    studentProfileId: string,
  ): Promise<string | null> {
    try {
      const primaryCv =
        await this.cvsRepository.findPrimaryCvForStudent(studentProfileId);

      if (!primaryCv) {
        return null;
      }

      let fileBuffer: Buffer;
      try {
        fileBuffer = await this.cvStorageService.downloadCvFile(
          primaryCv.filePath,
        );
      } catch (storageError: any) {
        this.logger.warn(
          `Could not download CV from storage for student [${studentProfileId}]: ${storageError?.message}`,
        );
        return null;
      }

      const extractedText = await this.cvTextExtractorService.extractText(
        fileBuffer,
        primaryCv.fileType,
      );

      return extractedText;
    } catch (error: any) {
      this.logger.warn(
        `Unexpected error during CV text resolution for student [${studentProfileId}]: ${error?.message}`,
      );
      return null;
    }
  }

  /**
   * Sanitizes CV database entity into response DTO (hiding storage filePath).
   */
  public mapCvToResponse(cv: CV): CvResponseDto {
    return {
      id: cv.id,
      fileName: cv.fileName,
      fileType: cv.fileType,
      fileSize: cv.fileSize,
      isDefault: cv.isDefault,
      uploadedAt: cv.uploadedAt,
    };
  }
}
