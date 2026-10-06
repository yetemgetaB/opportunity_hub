import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class CvStorageService {
  private readonly logger = new Logger(CvStorageService.name);
  private supabaseClient: SupabaseClient | null = null;
  private readonly bucketName = 'resumes';

  constructor(private readonly configService: ConfigService) {}

  private getClient(): SupabaseClient {
    if (this.supabaseClient) {
      return this.supabaseClient;
    }

    const supabaseUrl = this.configService.get<string>('database.supabaseUrl');
    const serviceRoleKey = this.configService.get<string>(
      'database.supabaseServiceRoleKey',
    );

    if (!supabaseUrl || !serviceRoleKey) {
      this.logger.error(
        'Supabase Storage is not configured (missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).',
      );
      throw new InternalServerErrorException(
        'Supabase Storage service is not properly configured.',
      );
    }

    this.supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    return this.supabaseClient;
  }

  /**
   * Constructs deterministic storage path:
   * students/{studentProfileId}/cvs/{cvId}-{sanitizedFileName}
   */
  buildStoragePath(
    studentProfileId: string,
    cvId: string,
    originalFileName: string,
  ): string {
    const sanitized = originalFileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_');
    return `students/${studentProfileId}/cvs/${cvId}-${sanitized}`;
  }

  /**
   * Upload a CV file buffer to private Supabase Storage.
   */
  async uploadCvFile(
    filePath: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<{ filePath: string }> {
    const client = this.getClient();

    const { error } = await client.storage
      .from(this.bucketName)
      .upload(filePath, buffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      this.logger.error(
        `Failed to upload CV file to storage path [${filePath}]: ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Failed to upload CV to storage: ${error.message}`,
      );
    }

    this.logger.log(`Successfully uploaded CV file to [${filePath}]`);
    return { filePath };
  }

  /**
   * Download a CV file buffer from private Supabase Storage.
   */
  async downloadCvFile(filePath: string): Promise<Buffer> {
    const client = this.getClient();

    const { data, error } = await client.storage
      .from(this.bucketName)
      .download(filePath);

    if (error || !data) {
      this.logger.warn(
        `Failed to download CV file from storage path [${filePath}]: ${error?.message || 'No data returned'}`,
      );
      throw new NotFoundException('CV file not found in storage.');
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Delete a CV file from private Supabase Storage.
   */
  async deleteCvFile(filePath: string): Promise<void> {
    const client = this.getClient();

    const { error } = await client.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      this.logger.error(
        `Failed to delete CV file from storage path [${filePath}]: ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Failed to delete CV file from storage: ${error.message}`,
      );
    }

    this.logger.log(`Successfully deleted CV file from [${filePath}]`);
  }

  /**
   * Create a short-lived signed URL for secure, temporary file download.
   */
  async createSignedDownloadUrl(
    filePath: string,
    expiresInSeconds: number = 300,
  ): Promise<string> {
    const client = this.getClient();

    const { data, error } = await client.storage
      .from(this.bucketName)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      this.logger.error(
        `Failed to generate signed download URL for [${filePath}]: ${error?.message || 'No URL generated'}`,
      );
      throw new InternalServerErrorException(
        'Failed to generate secure CV download link.',
      );
    }

    return data.signedUrl;
  }
}
