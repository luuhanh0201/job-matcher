import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CvProcessingResultStatus,
  CvProcessingRequestStatus,
  CvProcessingState,
} from '@/enum/index.enum';
import { Cv, UploadStatus } from '@/modules/cv/entities/cv.entity';
import { ParsedCv } from '@/modules/cv/entities/parsed-cv.entity';
import { PdfParserService } from '@/modules/cv/service/pdf-parser.service';
import { TextPreprocessorService } from './text-preprocessor.service';

type CvProcessingRequestResponse = {
  cvId: string;
  status: CvProcessingRequestStatus;
};

@Injectable()
export class CvProcessingService {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
    @InjectRepository(ParsedCv)
    private readonly parsedCvRepository: Repository<ParsedCv>,
    private readonly pdfParserService: PdfParserService,
    private readonly textPreprocessorService: TextPreprocessorService,
  ) {}

  testProcessing(): { status: 'ok'; mode: 'db-processing' } {
    return {
      status: 'ok',
      mode: 'db-processing',
    };
  }

  async addCvProcessingJob(
    cvDocumentId: string,
  ): Promise<CvProcessingRequestResponse> {
    const cv = await this.cvRepository.findOneBy({ id: cvDocumentId });
    if (!cv) {
      throw new NotFoundException(`CV ${cvDocumentId} not found`);
    }

    cv.uploadStatus = UploadStatus.PENDING;
    cv.processingError = null;
    await this.cvRepository.save(cv);

    // Run processing in the background after persisting the request state.
    void this.processCvDocument(cvDocumentId);

    return {
      cvId: cvDocumentId,
      status: CvProcessingRequestStatus.PENDING,
    };
  }

  async getCvStatus(cvId: string): Promise<Record<string, unknown>> {
    const cv = await this.cvRepository.findOneBy({ id: cvId });
    if (!cv) {
      return { status: CvProcessingRequestStatus.NOT_FOUND };
    }

    const parsedCv = await this.parsedCvRepository.findOneBy({
      cv: { id: cv.id },
    });

    const parsedData = parsedCv
      ? {
          candidateName: parsedCv.candidateName,
          email: parsedCv.email,
          phone: parsedCv.phone,
          totalExperienceYears: parsedCv.totalExperienceYears,
          currentTitle: parsedCv.currentTitle,
          skills: parsedCv.skills,
          education: parsedCv.education,
          workExperience: parsedCv.workExperience,
          certifications: parsedCv.certifications,
          languages: parsedCv.languages,
        }
      : null;

    let state: CvProcessingState;
    if (cv.uploadStatus === UploadStatus.FAILED) {
      state = CvProcessingState.FAILED;
    } else if (parsedData) {
      state = CvProcessingState.COMPLETED;
    } else if (cv.uploadStatus === UploadStatus.PENDING) {
      state = CvProcessingState.ACTIVE;
    } else {
      state = CvProcessingState.WAITING;
    }

    const result = parsedData
      ? {
          cvDocumentId: cv.id,
          status: CvProcessingResultStatus.COMPLETED,
          parsedData,
        }
      : state === CvProcessingState.FAILED
        ? {
            cvDocumentId: cv.id,
            status: CvProcessingResultStatus.FAILED,
          }
        : null;

    return {
      id: cv.id,
      name: 'process-cv',
      state,
      progress:
        state === CvProcessingState.COMPLETED
          ? 100
          : state === CvProcessingState.ACTIVE
            ? 50
            : 0,
      data: { cvDocumentId: cv.id },
      result,
      parsedData,
      failedReason:
        state === CvProcessingState.FAILED ? cv.processingError : null,
      attemptsMade: 1,
    };
  }

  private async processCvDocument(cvDocumentId: string) {
    const cv = await this.cvRepository.findOneBy({ id: cvDocumentId });
    if (!cv) {
      return;
    }

    try {
      const response = await fetch(cv.fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to download CV file: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const parsedPdf = await this.pdfParserService.parsePdf({
        mimetype: 'application/pdf',
        buffer,
      });

      if (parsedPdf.isScanned) {
        throw new Error(
          'PDF appears scanned or has too little extractable text',
        );
      }

      const preprocessed = this.textPreprocessorService.preprocess(
        parsedPdf.text,
      );

      const existing = await this.parsedCvRepository.findOneBy({
        cv: { id: cv.id },
      });

      const payload = {
        candidateName: preprocessed.profile.candidateName,
        email: preprocessed.basicInfo.email,
        phone: preprocessed.basicInfo.phone,
        totalExperienceYears: preprocessed.profile.totalExperienceYears,
        currentTitle: preprocessed.profile.currentTitle,
        skills: preprocessed.resolved.skills,
        education: preprocessed.resolved.education,
        workExperience: preprocessed.resolved.workExperience,
        certifications: preprocessed.resolved.certifications,
        languages: preprocessed.resolved.languages,
      };

      if (existing) {
        await this.parsedCvRepository.save(
          this.parsedCvRepository.merge(existing, payload),
        );
      } else {
        await this.parsedCvRepository.save(
          this.parsedCvRepository.create({
            cv,
            ...payload,
          }),
        );
      }

      cv.uploadStatus = UploadStatus.COMPLETED;
      cv.processingError = null;
      await this.cvRepository.save(cv);
    } catch (error) {
      cv.uploadStatus = UploadStatus.FAILED;
      cv.processingError =
        error instanceof Error ? error.message : 'Unknown CV processing error';
      await this.cvRepository.save(cv);
    }
  }
}
