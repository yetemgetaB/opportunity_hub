import { Test, TestingModule } from '@nestjs/testing';
import * as mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { CvTextExtractorService } from './cv-text-extractor.service';

jest.mock('mammoth');
jest.mock('pdf-parse');

describe('CvTextExtractorService', () => {
  let service: CvTextExtractorService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CvTextExtractorService],
    }).compile();

    service = module.get<CvTextExtractorService>(CvTextExtractorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractText', () => {
    it('should return null if buffer is empty or not provided', async () => {
      const result1 = await service.extractText(Buffer.from([]), 'application/pdf');
      const result2 = await service.extractText(null as any, 'application/pdf');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it('should extract and normalize text from a valid PDF', async () => {
      const mockGetText = jest.fn().mockResolvedValue({
        text: '  John Doe \r\n Software Engineer \n\n\n Skills: TypeScript, NestJS  ',
      });
      const mockDestroy = jest.fn().mockResolvedValue(undefined);

      (PDFParse as unknown as jest.Mock).mockImplementation(() => ({
        getText: mockGetText,
        destroy: mockDestroy,
      }));

      const buffer = Buffer.from('%PDF-1.4 mock content');
      const result = await service.extractText(buffer, 'application/pdf');

      expect(result).toBe('John Doe\nSoftware Engineer\n\nSkills: TypeScript, NestJS');
      expect(PDFParse).toHaveBeenCalledWith({ data: buffer });
      expect(mockGetText).toHaveBeenCalled();
      expect(mockDestroy).toHaveBeenCalled();
    });

    it('should extract and normalize text from a valid DOCX', async () => {
      (mammoth.extractRawText as jest.Mock).mockResolvedValue({
        value: 'Jane Smith\r\nBackend Developer\r\n\r\n\r\nExperience at Tech Corp',
      });

      const buffer = Buffer.from('PK mock docx content');
      const result = await service.extractText(
        buffer,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );

      expect(result).toBe('Jane Smith\nBackend Developer\n\nExperience at Tech Corp');
      expect(mammoth.extractRawText).toHaveBeenCalledWith({ buffer });
    });

    it('should return null for unsupported MIME types', async () => {
      const buffer = Buffer.from('plain text content');
      const result = await service.extractText(buffer, 'text/plain');

      expect(result).toBeNull();
    });

    it('should return null when PDF parsing throws an error (e.g. malformed or encrypted)', async () => {
      (PDFParse as unknown as jest.Mock).mockImplementation(() => ({
        getText: jest.fn().mockRejectedValue(new Error('Invalid PDF structure or password required')),
        destroy: jest.fn().mockResolvedValue(undefined),
      }));

      const buffer = Buffer.from('corrupted pdf data');
      const result = await service.extractText(buffer, 'application/pdf');

      expect(result).toBeNull();
    });

    it('should return null when DOCX parsing throws an error', async () => {
      (mammoth.extractRawText as jest.Mock).mockRejectedValue(
        new Error('Could not find main document part in docx'),
      );

      const buffer = Buffer.from('corrupted docx data');
      const result = await service.extractText(
        buffer,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );

      expect(result).toBeNull();
    });

    it('should return null if extracted text has fewer than 10 characters (empty / scanned PDF)', async () => {
      const mockGetText = jest.fn().mockResolvedValue({
        text: '   hi   ',
      });

      (PDFParse as unknown as jest.Mock).mockImplementation(() => ({
        getText: mockGetText,
        destroy: jest.fn().mockResolvedValue(undefined),
      }));

      const buffer = Buffer.from('%PDF-1.4 minimal');
      const result = await service.extractText(buffer, 'application/pdf');

      expect(result).toBeNull();
    });

    it('should truncate extracted text to MAX_EXTRACTED_CHARACTERS (40,000 chars)', async () => {
      const longText = 'A'.repeat(50000);
      const mockGetText = jest.fn().mockResolvedValue({
        text: longText,
      });

      (PDFParse as unknown as jest.Mock).mockImplementation(() => ({
        getText: mockGetText,
        destroy: jest.fn().mockResolvedValue(undefined),
      }));

      const buffer = Buffer.from('%PDF-1.4 long');
      const result = await service.extractText(buffer, 'application/pdf');

      expect(result).toHaveLength(CvTextExtractorService.MAX_EXTRACTED_CHARACTERS);
      expect(result).toBe('A'.repeat(40000));
    });
  });

  describe('normalizeText', () => {
    it('should normalize consecutive whitespace and line breaks', () => {
      const input = 'Line 1\r\n\r\n\r\nLine 2    with   extra   spaces\rLine 3';
      const output = service.normalizeText(input);

      expect(output).toBe('Line 1\n\nLine 2 with extra spaces\nLine 3');
    });

    it('should return empty string for null or empty input', () => {
      expect(service.normalizeText('')).toBe('');
      expect(service.normalizeText(null as any)).toBe('');
    });
  });
});
