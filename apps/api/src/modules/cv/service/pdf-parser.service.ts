import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

export interface ParsedPdfResult {
  text: string;
  pages: number;
  isScanned: boolean;
  metadata: unknown;
}

type PdfFile = {
  mimetype: string;
  buffer: Buffer;
};

@Injectable()
export class PdfParserService {
  private readonly logger = new Logger(PdfParserService.name);

  private validatePdf(file: PdfFile | undefined): asserts file is PdfFile {
    if (!file) {
      throw new BadRequestException('File không tồn tại');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        'Loại tệp không hợp lệ. Chỉ cho phép tệp PDF.',
      );
    }
  }

  async parsePdf(file: PdfFile): Promise<ParsedPdfResult> {
    this.validatePdf(file);

    let parser: PDFParse | null = null;

    try {
      parser = new PDFParse({ data: new Uint8Array(file.buffer) });
      const textResult = await parser.getText();
      const infoResult = await parser.getInfo();

      // Preserve line breaks so section split can detect headings.
      const cleanedText = textResult.text
        .replace(/\r/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      const isScanned = cleanedText.length < 100;

      return {
        text: cleanedText,
        pages: textResult.total,
        isScanned,
        metadata: infoResult.info,
      };
    } catch (error) {
      this.logger.error('Error parsing PDF', error as Error);
      throw new BadRequestException('Lỗi khi phân tích tệp PDF');
    } finally {
      if (parser) {
        await parser.destroy();
      }
    }
  }
}
