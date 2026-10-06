import { Injectable, Logger } from '@nestjs/common';
import * as mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class CvTextExtractorService {
  private readonly logger = new Logger(CvTextExtractorService.name);

  /**
   * Maximum character limit for extracted CV text before passing to AI analysis (~8,000 tokens).
   */
  public static readonly MAX_EXTRACTED_CHARACTERS = 40000;

  /**
   * Minimum character threshold below which content is considered effectively empty / unreadable.
   */
  public static readonly MIN_EXTRACTED_CHARACTERS = 10;

  /**
   * Supported MIME types for CV extraction.
   */
  public static readonly SUPPORTED_MIME_TYPES = {
    PDF: 'application/pdf',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };

  /**
   * Extracts readable text content from a PDF or DOCX buffer.
   * Returns normalized text or null if unextractable/empty.
   */
  async extractText(
    buffer: Buffer,
    mimeType: string,
  ): Promise<string | null> {
    if (!buffer || buffer.length === 0) {
      return null;
    }

    const normalizedMime = mimeType?.trim().toLowerCase();

    try {
      let rawText: string | null = null;

      if (normalizedMime === CvTextExtractorService.SUPPORTED_MIME_TYPES.PDF) {
        rawText = await this.extractFromPdf(buffer);
      } else if (
        normalizedMime ===
        CvTextExtractorService.SUPPORTED_MIME_TYPES.DOCX
      ) {
        rawText = await this.extractFromDocx(buffer);
      } else {
        this.logger.warn(
          `Unsupported MIME type for CV text extraction: [${mimeType}]`,
        );
        return null;
      }

      if (!rawText) {
        return null;
      }

      const cleanedText = this.normalizeText(rawText);

      if (
        cleanedText.length <
        CvTextExtractorService.MIN_EXTRACTED_CHARACTERS
      ) {
        this.logger.log(
          'Extracted text is empty or below readable threshold (e.g. scanned image PDF). Returning null.',
        );
        return null;
      }

      // Enforce max character limit to safeguard downstream AI context
      if (
        cleanedText.length >
        CvTextExtractorService.MAX_EXTRACTED_CHARACTERS
      ) {
        return cleanedText.slice(
          0,
          CvTextExtractorService.MAX_EXTRACTED_CHARACTERS,
        );
      }

      return cleanedText;
    } catch (error: any) {
      this.logger.warn(
        `Failed to extract text from document: ${error?.message || 'Unknown extraction error'}`,
      );
      return null;
    }
  }

  /**
   * Extracts raw text from PDF buffer using pdf-parse.
   */
  private async extractFromPdf(buffer: Buffer): Promise<string | null> {
    let parser: PDFParse | null = null;
    try {
      parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result?.text || null;
    } catch (error: any) {
      this.logger.warn(`PDF parsing error: ${error?.message}`);
      return null;
    } finally {
      if (parser) {
        try {
          await parser.destroy();
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }

  /**
   * Extracts raw text from DOCX buffer using mammoth.
   */
  private async extractFromDocx(buffer: Buffer): Promise<string | null> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result?.value || null;
    } catch (error: any) {
      this.logger.warn(`DOCX parsing error: ${error?.message}`);
      return null;
    }
  }

  /**
   * Normalizes whitespace, carriage returns, and excessive newlines.
   */
  public normalizeText(text: string): string {
    if (!text) {
      return '';
    }

    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
